# Nexo — Escape Room del chat

Nexo convierte al chat de Twitch en un equipo que crea y resuelve un Escape Room en vivo. El streamer revisa las ideas de tema, el chat busca pistas, vota los efectos del overlay y Mimo —el Co-Caster visual— reacciona a los momentos de la partida.

## Funciones

- Salas generadas en español con OpenAI Responses API y salida JSON validada. Cada sala tiene tres pistas lógicas, un código y un ambiente visual (submarino, espacial, embrujado o jungla).
- Una sala de respaldo jugable si no hay clave de OpenAI o si falla la generación.
- Co-Caster Mimo: reacciones breves, amables y basadas en hasta ocho mensajes recientes; hay frases locales de respaldo.
- Chat de Twitch mediante EventSub WebSocket y autorización Device Code.
- Canjes de puntos de canal conectados a acciones de Nexo mediante EventSub; las acciones aceptadas se limitan a una pista, un estilo, una propuesta de tema y una reacción de Mimo.
- Interacción comunitaria: la participación carga energía, `!pista` desbloquea ayuda y el chat vota por efectos visuales.
- Escena 3D con Three.js, efectos ambientales y overlay para OBS en `http://localhost:4173/?overlay=1`.

El modelo recibe el tema elegido por el streamer al generar una sala. Para las reacciones, recibe los últimos ocho mensajes que llegaron a la aplicación. No envíes información privada en esos mensajes. Las respuestas se limitan a texto y opciones enumeradas; la aplicación no ejecuta HTML, CSS ni JavaScript generado. Twitch solicita `user:read:chat` y `channel:read:redemptions`: Nexo puede leer chat y canjes, pero no crear, cancelar ni completar recompensas. Los canjes permanecen sujetos al flujo de administración de Twitch. Mimo se muestra en el overlay y no escribe en el chat. Los tokens de Twitch se mantienen en memoria y se eliminan al apagar el servidor.

## Requisitos y arranque

- Node.js 22 o posterior.
- Opcionales: una clave de OpenAI API y una aplicación de Twitch Developer Console.

```bash
npm install
cp .env.example .env # si aún no existe .env
npm start
```

Abre `http://localhost:4173`. No se necesitan paquetes adicionales. Sin credenciales, el modo demo usa una sala y reacciones locales.

## Prueba de usuario

Para que un streamer o compañero recorra la experiencia como usuario, sigue la [guía de prueba de usuario](GUIA-PRUEBA-STREAMER.md). Incluye los flujos demo, Twitch en vivo y OBS, criterios de aceptación y un formato para reportar resultados.

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
4. Autoriza los permisos de lectura de chat y canjes. Si ya habías conectado Nexo antes de esta versión, desconecta y vuelve a autorizar para agregar el permiso de puntos.
5. EventSub se suscribe a los mensajes y a los canjes de recompensas personalizadas. El token no se guarda en disco. Si tu canal no puede usar puntos o Twitch rechaza esa suscripción, el chat sigue conectado y las recompensas no estarán disponibles.

## Publicar para una prueba en línea

El archivo `render.yaml` prepara Nexo como un servicio web de Node en Render. Crea un Blueprint desde el repositorio y completa las variables marcadas como secretas en el panel de Render. Render requiere que un servicio público escuche en `0.0.0.0`; el manifiesto también establece ese host y la ruta de salud. Render Web Services permite conexiones WebSocket salientes, que Nexo necesita para EventSub de Twitch ([documentación de WebSockets](https://render.com/docs/websocket)).

- `TWITCH_CLIENT_ID`: Client ID de la app de Twitch. Nexo usa el flujo de código de dispositivo y no requiere el Client Secret.
- `APP_PASSWORD`: contraseña compartida para que solo el streamer y los testers abran el panel.
- `APP_SESSION_SECRET`: Render lo genera automáticamente al crear el Blueprint.
- `OVERLAY_TOKEN`: clave aleatoria que protege el enlace de OBS. Genérala con `openssl rand -hex 32` y no compartas el enlace públicamente.
- `OPENAI_API_KEY`: opcional; sin ella se usan respuestas de respaldo.

Al terminar el despliegue, Render muestra una URL pública. El panel pide `APP_PASSWORD`. Para OBS usa `https://TU-SERVICIO.onrender.com/?overlay=1&key=TU_OVERLAY_TOKEN`. Mantén esa dirección privada porque permite abrir el overlay del canal.

El plan gratuito de Render puede suspender servicios después de 15 minutos sin tráfico; la primera apertura posterior puede tardar. Es adecuado para compartir una prueba, no para una transmisión que requiera disponibilidad continua. El despliegue actual conecta un canal por instancia y los tokens de Twitch viven en memoria; si Render reinicia el proceso, hay que volver a autorizar Twitch. No subas `.env` al repositorio. Consulta las [limitaciones actuales del plan gratuito](https://render.com/docs/free) y la [configuración de Blueprints](https://render.com/docs/blueprint-spec).

El servicio requiere que este código esté publicado en un repositorio GitHub al que tengas acceso. Render configura el alojamiento desde ese repositorio; el paso de conectar la cuenta y crear el servicio se realiza en el panel de Render.

## Recompensas de puntos

Crea las recompensas en el panel de Twitch con estos títulos exactos. Nexo escucha sus canjes y ejecuta solo la acción asociada:

- `Nexo · Pista` — muestra una pista sobre el siguiente objeto sin gastar energía colectiva.
- `Nexo · Estilo` — pide al espectador que escriba `neon`, `ambar` o `bruma` en el campo de mensaje del canje.
- `Nexo · Tema` — pide una idea en el mensaje; se coloca en el campo del streamer para que la revise antes de crear la sala.
- `Nexo · Mimo` — solicita una reacción del Co-Caster.

Para proteger la escena, los títulos de otras recompensas no ejecutan comandos. La versión actual no crea recompensas ni cambia su estado en Twitch.

## Comandos

- `!examinar reloj`, `!examinar estatua`, `!examinar antorcha` — descubre una cifra.
- `!codigo 241` — intenta abrir la bóveda con el código revelado.
- `!pista` — gasta 12 puntos de energía cuando la comunidad alcanza 35.
- `!tema una estación espacial` — propone un tema y lo deja en el campo del streamer; no inicia una sala por sí solo.
- `!votar neon`, `!votar ambar`, `!votar bruma` — votación por mayoría entre participantes únicos; con tres votos y una opción líder se aplica el estilo.
- `!estilo neon`, `!estilo ambar`, `!estilo bruma` — cambia inmediatamente entre estilos permitidos.
- `!reacciona` — pide una línea de Mimo basada en el contexto reciente.
- `!ayuda` — muestra la lista de comandos.
- En modo demo, `!canje pista`, `!canje estilo neon`, `!canje tema bosque` y `!canje mimo` simulan recompensas para probarlas sin conectar Twitch.

Los temas propuestos por el chat se revisan antes de crear una sala. Los usuarios no pueden enviar CSS ni código; solo pueden elegir entre los estilos permitidos. La participación repetida tiene enfriamiento.

## Archivos

- `server.mjs`: servidor Node, endpoints locales, generación de salas y conexión Twitch.
- `app.js`: partida, comandos, Co-Caster y sincronización del overlay.
- `index.html`, `styles.css`, `enhancements.css`, `scene3d.js`: panel, escena 3D con Three.js y overlay OBS.
- `.env.example`: nombres de variables sin credenciales.
