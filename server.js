// Corre UNA sala decorativa de Haxball en Render (plan gratis).
// Variables de entorno en Render:
//   DECO  = 1, 2, 3 o 4  (cuál decoración abrir; por defecto 1)
//   TOKEN = token de https://www.haxball.com/headlesstoken  (vence en minutos: pegalo y guardá enseguida)
const http = require("http");
const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright-core");

const PORT = process.env.PORT || 10000;
const DECO = String(process.env.DECO || "1");
const TOKEN = (process.env.TOKEN || "").trim();
const URL_HEADLESS = process.env.HEADLESS_URL || "https://www.haxball.com/headless";

let estado = "iniciando";
let link = "";
let ultimoLog = [];
const log = (m) => { const l = new Date().toISOString() + " " + m; console.log(l); ultimoLog.push(l); if (ultimoLog.length > 30) ultimoLog.shift(); };

// Este servidor web existe para que Render vea el servicio "vivo" y para que un servicio externo lo visite cada pocos minutos (así no se duerme).
http.createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
  res.end("Decoración " + DECO + " | estado: " + estado + (link ? " | sala: " + link : "") + "\n\n" + ultimoLog.join("\n"));
}).listen(PORT, () => log("Servidor web escuchando en el puerto " + PORT));

async function iniciar() {
  const archivo = fs.readdirSync(path.join(__dirname, "deco")).find((f) => f.startsWith("deco_" + DECO + "_"));
  if (!archivo) { estado = "ERROR: no existe la decoración " + DECO; log(estado); return; }
  if (!TOKEN) { estado = "ERROR: falta la variable TOKEN"; log(estado); return; }
  let codigo = fs.readFileSync(path.join(__dirname, "deco", archivo), "utf8");
  if (!/const TOKEN = "";/.test(codigo)) { estado = "ERROR: no encontré la línea del token en " + archivo; log(estado); return; }
  codigo = codigo.replace('const TOKEN = "";', "const TOKEN = " + JSON.stringify(TOKEN) + ";");
  log("Abriendo navegador para " + archivo);
  const browser = await chromium.launch({
    args: ["--no-sandbox", "--disable-dev-shm-usage", "--disable-gpu", "--disable-extensions", "--mute-audio",
           "--disable-features=WebRtcHideLocalIpsWithMdns", "--js-flags=--max-old-space-size=96"]
  });
  const page = await browser.newPage();
  page.on("console", (m) => {
    const t = m.text();
    log("[sala] " + t.slice(0, 200));
    const k = t.match(/^ROOMLINK (\S+)/);
    if (k) { link = k[1]; estado = "sala abierta"; }
  });
  page.on("pageerror", (e) => log("[error página] " + String(e).slice(0, 200)));
  browser.on("disconnected", () => { estado = "navegador cerrado"; log(estado); });
  await page.goto(URL_HEADLESS, { waitUntil: "domcontentloaded", timeout: 60000 });
  // El iframe del headless expone HBInit en la propia página; el script de la decoración se ejecuta ahí.
  await page.waitForFunction(() => typeof window.HBInit === "function", null, { timeout: 60000 });
  // Se engancha onRoomLink para poder mostrar el link de la sala en la página de estado.
  await page.evaluate(() => {
    const original = window.HBInit;
    window.HBInit = function (cfg) { const r = original(cfg); r.onRoomLink = (l) => console.log("ROOMLINK " + l); return r; };
  });
  await page.evaluate(codigo);
  estado = "esperando link de la sala";
  setTimeout(() => { if (estado === "esperando link de la sala") { estado = "sin link: token vencido o inválido?"; log(estado); } }, 60000);
}

iniciar().catch((e) => { estado = "ERROR: " + String(e).slice(0, 200); log(estado); });
