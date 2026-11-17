// Sala DECORATIVA (ABAJO de la principal): no se puede jugar, solo aparece en la lista como adorno.
// Cómo usarla: abrí https://www.haxball.com/headless en una pestaña NUEVA, pegá este código en la consola,
// sacá un token en https://www.haxball.com/headlesstoken y pegalo abajo ANTES de ejecutar. Cada sala necesita su propio token.
const TOKEN = "";   // <-- pegá acá el token (vence en pocos minutos)
const NOMBRE = "» ══════════ ⌈ 💩 ⌋ ══════════ «";
// Geo corrido hacia abajo para dejar lugar al 3v3 justo debajo de JUEGAN TODOS.
const GEO = { code: "AR", lat: -34.618005, lon: -58.379035 };

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
