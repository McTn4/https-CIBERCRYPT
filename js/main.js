// -----------------------------
// main.js — Criptos, Empresas y Noticias Internacionales
// -----------------------------

// Mostrar año actual en footer
const elYear = document.getElementById("year");
if (elYear) elYear.textContent = new Date().getFullYear();

// Menú hamburguesa (sidebar)
const hamburger = document.getElementById("hamburger");
const sidebar = document.getElementById("sidebar");
if (hamburger && sidebar) {
  hamburger.addEventListener("click", () => sidebar.classList.toggle("active"));
}

// -----------------------------
// Criptomonedas (CoinGecko)
async function cargarCriptos() {
  try {
    const resp = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,cardano,solana,dogecoin,polkadot,tron,chainlink,shiba-inu,litecoin"
    );
    if (!resp.ok) throw new Error("CoinGecko HTTP " + resp.status);
    const data = await resp.json();

    const filas = data.map(c => {
      const change = Number(c.price_change_percentage_24h ?? 0);
      return `
        <tr>
          <td>${c.name} (${(c.symbol || "").toUpperCase()})</td>
          <td>$${Number(c.current_price ?? 0).toLocaleString()}</td>
          <td style="color:${change >= 0 ? 'lime' : 'red'};">
            ${change.toFixed(2)}%
          </td>
        </tr>
      `;
    }).join("");

    const t = document.getElementById("tabla-criptos");
    if (t) t.innerHTML = filas;
  } catch (err) {
    console.error("Error cargando criptos:", err);
    const t = document.getElementById("tabla-criptos");
    if (t) t.innerHTML = "<tr><td colspan='3'>Error al cargar criptos</td></tr>";
  }
}

// -----------------------------
// Empresas (simuladas)
function cargarEmpresas() {
  const accionesSim = [
    { name: "Apple", symbol: "AAPL", price: 175.32, changePct: 0.85 },
    { name: "Microsoft", symbol: "MSFT", price: 310.45, changePct: -0.12 },
    { name: "Google", symbol: "GOOGL", price: 1325.55, changePct: 0.55 },
    { name: "Amazon", symbol: "AMZN", price: 145.21, changePct: -0.25 },
    { name: "Tesla", symbol: "TSLA", price: 820.34, changePct: 1.12 },
    { name: "Meta", symbol: "META", price: 285.76, changePct: -0.34 },
    { name: "NVIDIA", symbol: "NVDA", price: 475.12, changePct: 2.15 },
    { name: "Netflix", symbol: "NFLX", price: 410.67, changePct: 1.05 },
    { name: "Adobe", symbol: "ADBE", price: 520.33, changePct: -0.45 },
    { name: "JPMorgan", symbol: "JPM", price: 150.12, changePct: 0.22 }
  ];

  const filas = accionesSim.map(a => `
    <tr>
      <td>${a.name} (${a.symbol})</td>
      <td>$${Number(a.price).toLocaleString()}</td>
      <td style="color:${a.changePct >= 0 ? 'lime' : 'red'};">
        ${a.changePct.toFixed(2)}%
      </td>
    </tr>
  `).join("");

  const t = document.getElementById("tabla-empresas");
  if (t) t.innerHTML = filas;
}

// -----------------------------
// Renderizar noticias
function renderArticles(normalizedArticles) {
  const cont = document.getElementById("lista-noticias");
  if (!cont) return;
  if (!Array.isArray(normalizedArticles) || normalizedArticles.length === 0) {
    cont.innerHTML = "<p>No hay noticias disponibles.</p>";
    return;
  }

  const html = normalizedArticles.slice(0, 8).map(a => {
    const desc = a.description ? a.description.replace(/<\/?[^>]+(>|$)/g, "").slice(0, 180) : "";
    return `
      <article class="noticia">
        <h3>${a.title}</h3>
        <p>${desc}</p>
        <a href="${a.url}" target="_blank" rel="noopener noreferrer">Leer más</a>
      </article>
    `;
  }).join("");
  cont.innerHTML = html;
}

// -----------------------------
// NewsAPI (internacional)
async function cargarNoticiasNewsAPI() {
  const lista = document.getElementById("lista-noticias");
  if (!lista) return;

  const apiKey = "TU_API_KEY_AQUI"; // 👈 Reemplaza por tu API Key
  if (!apiKey || apiKey === "TU_API_KEY_AQUI") {
    lista.innerHTML = "<p>Introduce tu API key de NewsAPI para ver noticias internacionales. Se usará fallback RSS si no hay clave.</p>";
    throw new Error("No API key NewsAPI");
  }

  const q = encodeURIComponent("stock market OR cryptocurrency OR finance OR economy OR bolsa OR criptomonedas OR finanzas");
  const url = `https://newsapi.org/v2/everything?q=${q}&language=en&sortBy=publishedAt&pageSize=8&apiKey=${apiKey}`;

  const resp = await fetch(url);
  if (!resp.ok) throw new Error("NewsAPI HTTP " + resp.status);
  const data = await resp.json();
  if (data.status !== "ok" || !Array.isArray(data.articles)) throw new Error("NewsAPI error");

  const normalized = data.articles.map(a => ({
    title: a.title,
    description: a.description,
    url: a.url,
    source: a.source?.name
  }));

  renderArticles(normalized);
}

// -----------------------------
// Fallback RSS (Google News Internacional)
async function cargarNoticiasRSSfallback() {
  const lista = document.getElementById("lista-noticias");
  if (!lista) return;

  const googleRSS = "https://news.google.com/rss/search?q=stock+market+OR+cryptocurrency+OR+finance+OR+economy&hl=en-US&gl=US&ceid=US:en";
  const rss2jsonUrl = `https://api.rss2json.com/v1/api.json?rss_url=${encodeURIComponent(googleRSS)}`;

  try {
    const resp = await fetch(rss2jsonUrl);
    if (!resp.ok) throw new Error("RSS HTTP " + resp.status);
    const data = await resp.json();
    if (data.status !== "ok" || !Array.isArray(data.items)) throw new Error("RSS no items");

    const normalized = data.items.map(it => ({
      title: it.title,
      description: it.description,
      url: it.link,
      source: it.author || it.source || ""
    }));

    renderArticles(normalized);
  } catch (err) {
    console.error("Fallback RSS falló:", err);
    lista.innerHTML = "<p>No se pudieron cargar noticias desde NewsAPI ni RSS. Revisa la consola.</p>";
  }
}

// -----------------------------
// Noticias con fallback
async function cargarNoticiasConFallback() {
  const lista = document.getElementById("lista-noticias");
  if (lista) lista.innerHTML = "<p>Cargando noticias internacionales...</p>";

  try {
    await cargarNoticiasNewsAPI();
  } catch (err) {
    console.warn("NewsAPI falló, usando fallback RSS.", err);
    await cargarNoticiasRSSfallback();
  }
}

// -----------------------------
// Inicializar app
function iniciarApp() {
  cargarCriptos();
  cargarEmpresas();
  cargarNoticiasConFallback();

  setInterval(cargarCriptos, 30000);           // Criptos cada 30s
  setInterval(cargarNoticiasConFallback, 60000); // Noticias cada 1min
}

iniciarApp();
const apiKey = "c0b1a87b2c5b4071a8b517dd195f73f1";
