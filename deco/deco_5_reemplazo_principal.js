// Sala REEMPLAZO de la principal: título con el link de Discord y MISMO punto (geo) que la sala principal, para ocupar su lugar en la lista cuando la principal está cerrada.
// No se puede jugar: tiene contraseña desconocida y si alguien entra lo expulsan.
// Cómo usarla a mano: abrí https://www.haxball.com/headless en una pestaña NUEVA, pegá este código en la consola,
// sacá un token en https://www.haxball.com/headlesstoken y pegalo abajo ANTES de ejecutar. Cada sala necesita su propio token.
const TOKEN = "";   // <-- pegá acá el token (vence en pocos minutos)
// Espacios al principio para correr el título hacia el medio de la fila (la lista alinea a la izquierda). Si lo ves muy a la izquierda o a la derecha, sumá o sacá "\u2002" (espacio angosto, ~7 px) o "\u2003" (espacio ancho, ~14 px).
const RELLENO = "\u2003\u2003";
const NOMBRE = RELLENO + "🟤 discord.gg/DDduCYwkP4 🟤";
const GEO = { code: "AR", lat: -34.61783, lon: -58.37921 };   // igual al de la principal (GEO en futsal3.js)

const clave = Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
const room = HBInit({
  roomName: NOMBRE,
  maxPlayers: 28,
  public: true,
  noPlayer: true,
  password: clave,     // con contraseña desconocida: nadie puede entrar
  token: TOKEN,
  geo: GEO
});
room.onPlayerJoin = function (p) { room.kickPlayer(p.id, "Sala cerrada por ahora. Volvé más tarde. Discord: https://discord.gg/DDduCYwkP4", false); };
