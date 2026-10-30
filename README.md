# Nexo — Escape Room del chat

Nexo convierte al chat de Twitch en un equipo que crea y resuelve un Escape Room en vivo. El streamer revisa las ideas de tema, el chat busca pistas, vota los efectos del overlay y Mimo —el Co-Caster visual— reacciona a los momentos de la partida.

## Funciones

- Salas generadas en español con OpenAI Responses API y salida JSON validada. Cada sala tiene tres pistas lógicas, un código y un ambiente visual (submarino, espacial, embrujado o jungla).
- Una sala de respaldo jugable si no hay clave de OpenAI o si falla la generación.
- Co-Caster Mimo: reacciones breves, amables y basadas en hasta ocho mensajes recientes; hay frases locales de respaldo.
- Chat de Twitch mediante EventSub WebSocket y autorización Device Code.
- Interacción comunitaria: la participación carga energía, `!pista` desbloquea ayuda y el chat vota por efectos visuales.
- Modo demo y overlay para OBS en `http://localhost:4173/?overlay=1`.

El modelo recibe el tema elegido por el streamer al generar una sala. Para las reacciones, recibe los últimos ocho mensajes que llegaron a la aplicación. No envíes información privada en esos mensajes. Las respuestas se limitan a texto y opciones enumeradas; la aplicación no ejecuta HTML, CSS ni JavaScript generado. Esta versión solicita únicamente `user:read:chat`; Mimo se muestra en el overlay y no escribe en el chat. Los tokens de Twitch se mantienen en memoria y se eliminan al apagar el servidor.

## Requisitos y arranque

- Node.js 22 o posterior.
- Opcionales: una clave de OpenAI API y una aplicación de Twitch Developer Console.

```bash
cp .env.example .env
npm start
```

Abre `http://localhost:4173`. No se necesitan paquetes adicionales. Sin credenciales, el modo demo usa una sala y reacciones locales.

## Activar OpenAI

Agrega la clave a `.env` (este archivo está excluido de Git):

```env
OPENAI_API_KEY=tu_clave
OPENAI_MODEL=gpt-4.1-mini
```

## Conectar Twitch

1. Registra una aplicación en [Twitch Developer Console](https://dev.twitch.tv/console/apps) y copia el Client ID a `.env` como `TWITCH_CLIENT_ID`.
2. Si el formulario pide OAuth Redirect URL, registra `http://localhost:4173`.
3. Reinicia el servidor, pulsa **Conectar Twitch** y autoriza el código en Twitch Activate.
4. EventSub se suscribe a los mensajes del canal cuya cuenta autorizaste. El token no se guarda en disco.

## Comandos

- `!examinar reloj`, `!examinar estatua`, `!examinar antorcha` — descubre una cifra.
- `!codigo 241` — intenta abrir la bóveda con el código revelado.
- `!pista` — gasta 12 puntos de energía cuando la comunidad alcanza 35.
- `!tema una estación espacial` — propone un tema y lo deja en el campo del streamer; no inicia una sala por sí solo.
- `!votar neon`, `!votar ambar`, `!votar bruma` — votación por mayoría entre participantes únicos; con tres votos y una opción líder se aplica el estilo.
- `!estilo neon`, `!estilo ambar`, `!estilo bruma` — cambia inmediatamente entre estilos permitidos.
- `!reacciona` — pide una línea de Mimo basada en el contexto reciente.
- `!ayuda` — muestra la lista de comandos.

Los temas propuestos por el chat se revisan antes de crear una sala. Los usuarios no pueden enviar CSS ni código; solo pueden elegir entre los estilos permitidos. La participación repetida tiene enfriamiento.

## Archivos

- `server.mjs`: servidor Node, endpoints locales, generación de salas y conexión Twitch.
- `app.js`: partida, comandos, Co-Caster y sincronización del overlay.
- `index.html`, `styles.css`, `enhancements.css`: panel del streamer, escena y overlay OBS.
- `.env.example`: nombres de variables sin credenciales.
