// Corre una o varias salas decorativas de Haxball en UN solo servicio de Render (plan gratis), en un solo navegador, una pestaña por sala.
// Variables de entorno en Render:
//   DECO  = números de las decoraciones, separados por coma. Ej: 1   o   1,2,3,4
//   TOKEN = un token por decoración, en el MISMO orden y separados por coma. Ej: tokenA,tokenB,tokenC,tokenD
//           (cada token sale de https://www.haxball.com/headlesstoken y vence en minutos: sacá todos juntos y guardá enseguida)
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const PORT = process.env.PORT || 10000;
const DECOS = String(process.env.DECO || "1").split(",").map((x) => x.trim()).filter(Boolean);
const TOKENS = String(process.env.TOKEN || "").split(",").map((x) => x.trim());
const URL_HEADLESS = process.env.HEADLESS_URL || "https://www.haxball.com/headless";

const salas = DECOS.map((d) => ({ deco: d, estado: "iniciando", link: "" }));
let ultimoLog = [];
const log = (m) => { const l = new Date().toISOString() + " " + m; console.log(l); ultimoLog.push(l); if (ultimoLog.length > 60) ultimoLog.shift(); };

// Este servidor web existe para que Render vea el servicio "vivo" y para que un servicio externo lo visite cada pocos minutos (así no se duerme).
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  const mem = Math.round(process.memoryUsage().rss / 1048576);
  res.end(salas.map((s) => "Decoración " + s.deco + " | " + s.estado + (s.link ? " | sala: " + s.link : "")).join("\n") + "\n\n(memoria del servidor: " + mem + " MB)\n\n" + ultimoLog.join("\n"));
}).listen(PORT, () => log("Servidor web escuchando en el puerto " + PORT));

async function abrirSala(browser, sala, token) {
  const archivo = fs.readdirSync(path.join(__dirname, "deco")).find((f) => f.startsWith("deco_" + sala.deco + "_"));
  if (!archivo) { sala.estado = "ERROR: no existe la decoración " + sala.deco; log(sala.estado); return; }
  if (!token) { sala.estado = "ERROR: falta el token de la decoración " + sala.deco; log(sala.estado); return; }
  let codigo = fs.readFileSync(path.join(__dirname, "deco", archivo), "utf8");
  if (!/const TOKEN = "";/.test(codigo)) { sala.estado = "ERROR: no encontré la línea del token en " + archivo; log(sala.estado); return; }
  codigo = codigo.replace('const TOKEN = "";', "const TOKEN = " + JSON.stringify(token) + ";");
  const page = await browser.newPage();
  page.on("console", (m) => {
    const t = m.text();
    const k = t.match(/^ROOMLINK (\S+)/);
    if (k) { sala.link = k[1]; sala.estado = "sala abierta"; log("[deco " + sala.deco + "] sala abierta"); }
    else log("[deco " + sala.deco + "] " + t.slice(0, 160));
  });
  page.on("pageerror", (e) => log("[deco " + sala.deco + " error] " + String(e).slice(0, 160)));
  await page.goto(URL_HEADLESS, { waitUntil: "domcontentloaded", timeout: 60000 });
  await page.waitForFunction(() => typeof window.HBInit === "function", null, { timeout: 60000 });
  // Se engancha onRoomLink para poder mostrar el link de la sala en la página de estado.
  await page.evaluate(() => {
    const original = window.HBInit;
    window.HBInit = function (cfg) { const r = original(cfg); r.onRoomLink = (l) => console.log("ROOMLINK " + l); return r; };
  });
  await page.evaluate(codigo);
  sala.estado = "esperando link de la sala";
  setTimeout(() => { if (sala.estado === "esperando link de la sala") { sala.estado = "sin link: token vencido o inválido?"; log("deco " + sala.deco + ": " + sala.estado); } }, 60000);
}

async function iniciar() {
  log("Abriendo navegador para las decoraciones: " + DECOS.join(", "));
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-extensions", "--mute-audio",
           "--disable-features=WebRtcHideLocalIpsWithMdns", "--js-flags=--max-old-space-size=96"]
  });
  browser.on("disconnected", () => { salas.forEach((s) => { s.estado = "navegador cerrado"; }); log("navegador cerrado"); });
  // Una sala por vez, con pausa, para no pasar de golpe el límite de memoria.
  for (let i = 0; i < salas.length; i++) {
    try { await abrirSala(browser, salas[i], TOKENS[i]); }
    catch (e) { salas[i].estado = "ERROR: " + String(e).slice(0, 160); log("deco " + salas[i].deco + " " + salas[i].estado); }
    await new Promise((r) => setTimeout(r, 4000));
  }
}

iniciar().catch((e) => { salas.forEach((s) => { s.estado = "ERROR: " + String(e).slice(0, 160); }); log("ERROR general: " + String(e).slice(0, 200)); });
