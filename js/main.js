// Actualiza el año automáticamente en el footer
document.getElementById("year").textContent = new Date().getFullYear();
document.getElementById("year").textContent = new Date().getFullYear();

async function cargarMercado() {
  try {
    let filas = "";

    // 1️⃣ Criptos reales desde CoinGecko
    const respuestaCripto = await fetch(
      "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,cardano,solana,dogecoin"
    );
    const criptos = await respuestaCripto.json();

    criptos.forEach(c => {
      filas += `
        <tr>
          <td>${c.name} (${c.symbol.toUpperCase()})</td>
          <td>$${c.current_price?.toLocaleString() || "0"}</td>
          <td style="color:${c.price_change_percentage_24h >= 0 ? 'lime' : 'red'};">
            ${(c.price_change_percentage_24h ?? 0).toFixed(2)}%
          </td>
        </tr>`;
    });

    // 2️⃣ Acciones simuladas (ficticias)
    const accionesSimuladas = [
      { name: "Apple", symbol: "AAPL", price: 175.32, changePct: 0.85 },
      { name: "Microsoft", symbol: "MSFT", price: 310.45, changePct: -0.12 },
      { name: "Google", symbol: "GOOGL", price: 1325.55, changePct: 0.55 },
      { name: "Amazon", symbol: "AMZN", price: 145.21, changePct: -0.25 },
      { name: "Tesla", symbol: "TSLA", price: 820.34, changePct: 1.12 },
    ];

    accionesSimuladas.forEach(a => {
      filas += `
        <tr>
          <td>${a.name} (${a.symbol})</td>
          <td>$${a.price.toLocaleString()}</td>
          <td style="color:${a.changePct >= 0 ? 'lime' : 'red'};">
            ${a.changePct.toFixed(2)}%
          </td>
        </tr>`;
    });

    // Actualizar tabla
    document.getElementById("tabla-mercado").innerHTML = filas;

  } catch (error) {
    console.error("Error al cargar datos:", error);
    document.getElementById("tabla-mercado").innerHTML =
      "<tr><td colspan='3'>Error al cargar datos</td></tr>";
  }
}

// Actualizar cada 30 segundos
setInterval(cargarMercado, 30000);
cargarMercado();

