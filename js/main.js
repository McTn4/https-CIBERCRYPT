// -----------------------------
// Mostrar año actual en footer
const footerYear = document.getElementById("year");
if (footerYear) footerYear.textContent = new Date().getFullYear();

// -----------------------------
// Pestañas y sidebar
const tabBtns = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

tabBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    const target = btn.dataset.tab;
    tabBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    tabContents.forEach(tc => tc.classList.remove("active"));
    document.getElementById(target).classList.add("active");
  });
});

// -----------------------------
// Mercado
const tablaCriptos = document.getElementById("tabla-criptos").querySelector("tbody");
const tablaEmpresas = document.getElementById("tabla-empresas").querySelector("tbody");

const listaCriptos = ["bitcoin","ethereum","cardano","solana","dogecoin","polkadot","shiba-inu","litecoin","ripple","avalanche"];

const empresasSim = [
  { name: "Apple", symbol: "AAPL", price: 175.32, changePct: 0.85 },
  { name: "Microsoft", symbol: "MSFT", price: 310.45, changePct: -0.12 },
  { name: "Google", symbol: "GOOGL", price: 1325.55, changePct: 0.55 },
  { name: "Amazon", symbol: "AMZN", price: 145.21, changePct: -0.25 },
  { name: "Tesla", symbol: "TSLA", price: 820.34, changePct: 1.12 },
  { name: "Meta", symbol: "META", price: 330.10, changePct: 0.72 },
  { name: "Netflix", symbol: "NFLX", price: 500.50, changePct: -0.15 },
  { name: "Nvidia", symbol: "NVDA", price: 280.40, changePct: 0.65 }
];

async function cargarMercado() {
  try {
    const respCripto = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${listaCriptos.join(",")}`);
    const criptos = await respCripto.json();
    tablaCriptos.innerHTML = criptos.map(c => `
      <tr>
        <td>${c.name} (${c.symbol.toUpperCase()})</td>
        <td>$${c.current_price?.toLocaleString() || "0"}</td>
        <td style="color:${c.price_change_percentage_24h >= 0 ? '#0f0' : '#f55'};">
          ${(c.price_change_percentage_24h ?? 0).toFixed(2)}%
        </td>
      </tr>
    `).join("");

    tablaEmpresas.innerHTML = empresasSim.map(e => `
      <tr>
        <td>${e.name} (${e.symbol})</td>
        <td>$${e.price.toLocaleString()}</td>
        <td style="color:${e.changePct >= 0 ? '#0f0' : '#f55'};">
          ${e.changePct.toFixed(2)}%
        </td>
      </tr>
    `).join("");
  } catch(err) {
    console.error("Error al cargar mercado:", err);
    tablaCriptos.innerHTML = "<tr><td colspan='3'>Error al cargar datos</td></tr>";
    tablaEmpresas.innerHTML = "<tr><td colspan='3'>Error al cargar datos</td></tr>";
  }
}

setInterval(cargarMercado, 30000);
cargarMercado();

// -----------------------------
// Detalle activo
const detalleActivo = document.getElementById("detalle-activo");
const volverBtn = document.getElementById("volver");

async function mostrarDetalleActivo(nombre, tipo) {
  tabContents.forEach(tc => tc.classList.remove("active"));
  detalleActivo.classList.add("active");

  document.getElementById("detalle-nombre").textContent = nombre;
  document.getElementById("detalle-precio").textContent = "Cargando precio...";
  document.getElementById("detalle-cambio").textContent = "Cargando cambio...";
  document.getElementById("noticias-relacionadas").innerHTML = "Cargando noticias...";

  let historial = [];
  let precioActual = 0;
  let cambio24h = 0;

  try {
    if(tipo === "cripto") {
      const id = nombre.toLowerCase().replace(/\s+/g, "-");
      const respHist = await fetch(`https://api.coingecko.com/api/v3/coins/${id}/market_chart?vs_currency=usd&days=7&interval=daily`);
      const dataHist = await respHist.json();
      historial = dataHist.prices.map(p => ({ x: new Date(p[0]), y: p[1] }));

      const respMercado = await fetch(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${id}`);
      const mercado = await respMercado.json();
      precioActual = mercado[0].current_price;
      cambio24h = mercado[0].price_change_percentage_24h;
    } else if(tipo === "empresa") {
      const empresa = empresasSim.find(e => e.name === nombre);
      precioActual = empresa.price;
      cambio24h = empresa.changePct;
      historial = Array.from({length: 7}, (_, i) => ({ x: `Día ${i+1}`, y: empresa.price * (1 + Math.random()*0.05 - 0.025) }));
    }

    document.getElementById("detalle-precio").textContent = `Precio: $${precioActual.toLocaleString()}`;
    document.getElementById("detalle-cambio").textContent = `Cambio 24h: ${cambio24h.toFixed(2)}%`;

    const ctx = document.getElementById('grafica-activo').getContext('2d');
    if(window.graficaActivo) window.graficaActivo.destroy();
    window.graficaActivo = new Chart(ctx, {
      type: 'line',
      data: {
        labels: historial.map(p => typeof p.x === "object" ? p.x.toLocaleDateString() : p.x),
        datasets: [{
          label: nombre,
          data: historial.map(p => p.y),
          borderColor: '#888',
          backgroundColor: 'rgba(100,100,100,0.2)',
          tension: 0.3,
          fill: true
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: {
          y: { beginAtZero: false, ticks: { color: '#ddd' } },
          x: { ticks: { color: '#ddd' } }
        }
      }
    });

    // Noticias relacionadas
    cargarNoticiasRelacionadas(nombre);

  } catch(err) {
    console.error("Error cargando detalle:", err);
  }
}

volverBtn.addEventListener("click", () => {
  detalleActivo.classList.remove("active");
  document.getElementById("mercado").classList.add("active");
});

function asignarClickTabla(tabla, tipo) {
  tabla.addEventListener("click", e => {
    const tr = e.target.closest("tr");
    if(tr && tr.querySelector("td")) {
      const nombre = tr.querySelector("td").textContent.split(" (")[0];
      mostrarDetalleActivo(nombre, tipo);
    }
  });
}

asignarClickTabla(tablaCriptos, "cripto");
asignarClickTabla(tablaEmpresas, "empresa");

// -----------------------------
// Noticias
const apiKeyNews = "417cc386668fa0b0aed74df6a338185a";

async function cargarNoticias() {
  const listaNoticias = document.getElementById("lista-noticias");
  try {
    const resp = await fetch(`https://gnews.io/api/v4/top-headlines?lang=es&topic=business&max=10&token=${apiKeyNews}`);
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    const data = await resp.json();

    if(!data.articles || data.articles.length === 0) {
      listaNoticias.innerHTML = "<p>No se encontraron noticias.</p>";
      return;
    }

    listaNoticias.innerHTML = data.articles.map(n => `
      <div class="noticia">
        <h3>${n.title}</h3>
        <p>${n.description || ""}</p>
        <a href="${n.url}" target="_blank">Leer más</a>
      </div>
    `).join("");

  } catch(err) {
    console.error("Error al cargar noticias:", err);
    listaNoticias.innerHTML = "<p>Error al cargar noticias.</p>";
  }
}

async function cargarNoticiasRelacionadas(nombre) {
  const cont = document.getElementById("noticias-relacionadas");
  try {
    const resp = await fetch(`https://gnews.io/api/v4/search?q=${encodeURIComponent(nombre)}&lang=es&max=5&token=${apiKeyNews}`);
    if (!resp.ok) throw new Error(`HTTP error! status: ${resp.status}`);
    const data = await resp.json();

    if(!data.articles || data.articles.length === 0) {
      cont.innerHTML = "<p>No hay noticias relacionadas.</p>";
      return;
    }

    cont.innerHTML = data.articles.map(n => `
      <div class="noticia">
        <h4>${n.title}</h4>
        <p>${n.description || ""}</p>
        <a href="${n.url}" target="_blank">Leer más</a>
      </div>
    `).join("");

  } catch(err) {
    console.error(err);
    cont.innerHTML = "<p>Error al cargar noticias.</p>";
  }
}

// Cargar noticias al inicio
cargarNoticias();

