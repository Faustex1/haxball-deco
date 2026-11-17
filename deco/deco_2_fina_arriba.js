// Sala DECORATIVA FINA (entre la principal y la decoración de ARRIBA): una línea delgada con espacio al principio y al final. No se puede jugar.
// Cómo usarla: abrí https://www.haxball.com/headless en una pestaña NUEVA, pegá este código en la consola,
// sacá un token en https://www.haxball.com/headlesstoken y pegalo abajo ANTES de ejecutar. Cada sala necesita su propio token.
const TOKEN = "";   // <-- pegá acá el token (vence en pocos minutos)
const ESPACIO = "\u2800";   // espacio invisible a la derecha (braille en blanco: Haxball no lo recorta)
const ESPACIO_IZQ = "\u2800".repeat(3);   // espacio invisible a la izquierda: más = la decoración se corre a la derecha (más centrada)
const L = (n) => "─".repeat(n);
const NOMBRE = ESPACIO_IZQ + L(5) + " ▪ " + L(9) + " ▪ " + L(5) + ESPACIO;   // ───── ▪ ───────── ▪ ─────  (cambiá los números de L() para alargar o acortar cada tramo)
// Punto geográfico entre la principal (lat -34.61783, lon -58.37921) y la decoración grande de arriba (-34.61773, -58.37931): queda DENTRO de las dos en la lista.
const GEO = { code: "AR", lat: -34.61778, lon: -58.37926 };

const clave = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
const room = HBInit({
  roomName: NOMBRE,
  maxPlayers: 2,
  public: true,
  noPlayer: true,
  password: clave,     // con contraseña desconocida: nadie puede entrar
  token: TOKEN,
  geo: GEO
});
room.onPlayerJoin = function (p) { room.kickPlayer(p.id, "Sala decorativa", false); };
