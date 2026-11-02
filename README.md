# Nexo — Escape Room del chat

Nexo convierte al chat de Twitch en un equipo que crea y resuelve un Escape Room en vivo. El streamer revisa las ideas de tema, el chat busca pistas y puede rediseñar la escena con comandos de estilo seguros. Mimo —el Co-Caster visual— cambia de expresión y reacciona a los momentos de la partida. El proyecto se desarrolló con OpenAI Codex y conecta la experiencia a Twitch mediante chat, EventSub y un overlay para OBS.

- **Panel del streamer:** https://twitch-pro.onrender.com/ (inicia sesión con Twitch y autoriza tu canal).
- **Acceso de espectador:** https://twitch-pro.onrender.com/demo (simulación pública con plantillas gratuitas; en un directo real, los espectadores participan desde el chat de Twitch).
- **Rama de código desplegada:** https://github.com/Martingon4/TWITCH-PRO/tree/codex/online-render. El servicio de Render sigue esta rama; usa este enlace para revisar la versión actual.
- **Paquete de entrega:** [lista final del hackathon](ENTREGA-HACKATHON.md), [borrador Devpost en inglés](DEVPOST-SUBMISSION.md), [guía de prueba en inglés](USER-TEST-GUIDE.en.md), [README en inglés](README.en.md) y [guion del video](VIDEO-SCRIPT.md).

## Funciones

- Catálogo de ocho plantillas jugables (nave, mansión, templo, laboratorio, base submarina, museo, estación polar y festival), más una aventura sorpresa. Cada una incluye una historia, tres acertijos, pistas graduales y un código comprobable.
- Modo plantilla seleccionado por defecto: no llama a OpenAI ni consume créditos de API. Se puede editar el tema para incorporarlo a la historia; la plantilla conserva sus acertijos. La opción de IA está separada y marcada porque sí consume créditos cuando la API acepta la solicitud.
- Si una generación con IA falla o no hay saldo, la app elige una plantilla y deja el motivo visible en el dossier.
- Co-Caster Mimo: reacciones breves, amables y basadas en hasta ocho mensajes recientes; hay frases locales de respaldo.
- Chat de Twitch mediante EventSub WebSocket y autorización Device Code.
- Canjes de puntos de canal conectados a acciones de Nexo mediante EventSub; las acciones aceptadas se limitan a una pista, un estilo, una propuesta de tema y una reacción de Mimo.
- Interacción comunitaria: la participación carga energía, `!pista` desbloquea ayuda y el chat activa paletas y animaciones de Three.js escribiendo una petición para Mimo.
- Presión de tiempo: cada ronda dura 3, 4 o 5 minutos (4 por defecto), con avisos al minuto, a los 30 y 10 segundos, más una pantalla de derrota y efecto rojo si se agota el tiempo.
- Escena 3D con Three.js, efectos ambientales y overlay para OBS en `http://localhost:4173/?overlay=1`.

En el modo de IA, el modelo recibe la situación elegida por el streamer al generar una sala. Para las reacciones, recibe los últimos ocho mensajes que llegaron a la aplicación. No envíes información privada en esos mensajes. Las respuestas se limitan a texto y opciones enumeradas; la aplicación no ejecuta HTML, CSS ni JavaScript generado. Twitch solicita `user:read:chat` y `channel:read:redemptions`: Nexo puede leer chat y canjes, pero no crear, cancelar ni completar recompensas. Los canjes permanecen sujetos al flujo de administración de Twitch. Mimo se muestra en el overlay y no escribe en el chat.

Cada autorización identifica un canal por su Twitch User ID. PostgreSQL separa por ese ID la sala activa, el progreso, hasta siete días del chat, los tokens cifrados y los eventos recientes. El panel recupera los últimos 60 mensajes. En el acceso, pulsa **ENTRAR COMO STREAMER CON TWITCH** para autorizar un canal o **PROBAR COMO ESPECTADOR** para abrir la demo pública. Los eventos se comparten entre instancias del servidor; un arrendamiento por canal evita sockets duplicados y una sesión controladora evita que dos pestañas ejecuten el mismo comando.

## Requisitos y arranque

- Node.js 22 o posterior.
- Opcionales: una clave de Gemini u OpenAI API y una aplicación de Twitch Developer Console.

```bash
npm install
cp .env.example .env
npm start
```

Abre `http://localhost:4173`. No se necesitan paquetes adicionales. Sin credenciales, el modo demo usa una sala y reacciones locales.

## Prueba de usuario

Para que un streamer o compañero recorra la experiencia como usuario, sigue la [guía de prueba de usuario](GUIA-PRUEBA-STREAMER.md). Incluye los flujos demo, Twitch en vivo y OBS, criterios de aceptación y un formato para reportar resultados.

Para clonar exactamente la versión que se ejecuta en Render:

```bash
git clone --branch codex/online-render --single-branch https://github.com/Martingon4/TWITCH-PRO.git
```

La rama predeterminada `main` todavía no contiene esta versión. Revisa el enlace a `codex/online-render` antes de descargar o enviar el repositorio a evaluación.

## Activar la generación de escenarios con IA

La app permite elegir Gemini u OpenAI para crear situaciones originales. Agrega la clave a `.env` (excluido de Git) en desarrollo, o como variable privada del servicio en Render. Gemini queda seleccionado al abrir el modo IA:

```env
GEMINI_API_KEY=tu_clave_de_google_ai_studio
GEMINI_MODEL=gemini-3.5-flash-lite
# Alternativa:
OPENAI_API_KEY=tu_clave
OPENAI_MODEL=gpt-4.1-mini
```

La clave se envía únicamente desde el servidor al proveedor seleccionado; no se incluye en el navegador. Las plantillas permanecen disponibles gratis si no se configura una clave o si el proveedor rechaza la solicitud. La generación con IA puede consumir cuota o créditos de la cuenta de ese proveedor. En Render, guarda `GEMINI_API_KEY` en **Environment** y reinicia/despliega el servicio.

## Conectar Twitch

1. Registra una aplicación en [Twitch Developer Console](https://dev.twitch.tv/console/apps) y copia el Client ID a `.env` como `TWITCH_CLIENT_ID`.
2. Si el formulario pide OAuth Redirect URL, registra `http://localhost:4173`.
3. En Render, pulsa **ENTRAR COMO STREAMER CON TWITCH** y autoriza el código en Twitch Activate. Eso autentica y conecta el canal.
4. Autoriza los permisos de lectura de chat y canjes. Si ya habías conectado Nexo antes de esta versión, vuelve a iniciar sesión para agregar el permiso de puntos.
5. EventSub se suscribe a los mensajes y a los canjes de recompensas personalizadas. En producción, Nexo cifra los tokens en PostgreSQL y los renueva al reconectar. Si tu canal no puede usar puntos o Twitch rechaza esa suscripción, el chat sigue conectado y las recompensas no estarán disponibles.

## Publicar para una prueba en línea

El archivo `render.yaml` prepara Nexo como un servicio web de Node en Render. Crea un Blueprint desde el repositorio y completa las variables marcadas como secretas en el panel de Render. Render requiere que un servicio público escuche en `0.0.0.0`; el manifiesto también establece ese host y la ruta de salud. Render Web Services permite conexiones WebSocket salientes, que Nexo necesita para EventSub de Twitch ([documentación de WebSockets](https://render.com/docs/websocket)).

- `TWITCH_CLIENT_ID`: Client ID de la app de Twitch. Nexo usa el flujo de código de dispositivo y no requiere el Client Secret.
- `APP_SESSION_SECRET`: Render lo genera automáticamente al crear el Blueprint y firma las sesiones de Twitch.
- `TOKEN_ENCRYPTION_KEY`: Render genera una clave para cifrar los tokens de Twitch guardados en PostgreSQL. No la cambies después de guardar autorizaciones, o los tokens tendrán que volver a conectarse.
- `DATABASE_URL`: URL interna de PostgreSQL; el Blueprint la enlaza con `twitch-pro-data`.
- `TWITCH_CLIENT_SECRET`: opcional si la app de Twitch está configurada como cliente público; es necesario para refrescar tokens de algunos clientes confidenciales.
- `OPENAI_API_KEY`: opcional para el modo de IA, que crea acertijos únicos y consume créditos de la API. Las plantillas funcionan sin esa clave.
- `GEMINI_API_KEY`: opcional; se configura en Render para activar la generación con Gemini.

Cada streamer inicia sesión autorizando su propia cuenta de Twitch. La API permite identificar Partner/Affiliate y consultar si transmite en ese momento; una cuenta offline o sin afiliación también puede ser streamer, así que el acceso permite elegir explícitamente el rol. El panel queda ligado a ese Twitch User ID; sus salas, chat y comandos no se mezclan con los de otros canales. Los espectadores pueden probar la simulación sin iniciar sesión y, en un directo, participan desde el chat. Usa **Copiar enlace del overlay** para obtener una dirección privada de OBS que apunta al canal conectado.

El Blueprint usa PostgreSQL gratuito para una prueba. Render elimina el acceso a esa base a los 30 días; antes de ese plazo, actualízala a un plan persistente y verifica que el servicio web también tenga un plan que permita escalar. Los servicios web gratuitos no admiten varias instancias. PostgreSQL conserva tokens cifrados y datos después de reinicios, pero un despliegue a gran escala requiere planes pagos, backups y monitoreo. No subas `.env` al repositorio. Consulta las [limitaciones actuales del plan gratuito](https://render.com/docs/free) y la [configuración de Blueprints](https://render.com/docs/blueprint-spec).

El servicio requiere que este código esté publicado en un repositorio GitHub al que tengas acceso. Render configura el alojamiento desde ese repositorio; el paso de conectar la cuenta y crear el servicio se realiza en el panel de Render.

Para evaluación, comparte la demo pública de plantillas y estos pasos: abre `/demo`, elige una escena, crea la sala y sigue los comandos que aparecen. Para demostrar la conexión real, muestra el panel privado y el overlay con un canal Twitch de prueba; no compartas la contraseña ni la URL privada del overlay.

## Recompensas de puntos

Crea las recompensas en el panel de Twitch con estos títulos exactos. Nexo escucha sus canjes y ejecuta solo la acción asociada:

- `Nexo · Pista` — muestra una pista sobre el siguiente objeto sin gastar energía colectiva.
- `Nexo · Estilo` — acepta una petición visual, como `aurora`, `latido`, `cristal`, `lluvia`, `neón`, `ámbar` o `azul`.
- `Nexo · Tema` — pide una idea en el mensaje; se coloca en el campo del streamer para que la revise antes de crear la sala.
- `Nexo · Mimo` — solicita una reacción del Co-Caster.

Para proteger la escena, los títulos de otras recompensas no ejecutan comandos. La versión actual no crea recompensas ni cambia su estado en Twitch.

## Comandos

- `!examinar [objeto]` — muestra el acertijo asociado a un objeto de esta sala.
- `!resolver [objeto] [respuesta]` — comprueba la solución y revela la cifra correspondiente.
- `!codigo [código]` — abre la bóveda al acertar; si el chat ya conoce la combinación puede probarla sin resolver todos los acertijos.
- `!pista` — gasta 12 puntos de energía cuando la comunidad alcanza 35.
- `!tema una estación espacial` — propone un tema y lo deja en el campo del streamer; no inicia una sala por sí solo.
- `!estilo aurora`, `!estilo latido`, `!estilo cristal`, `!estilo lluvia` — activa animaciones y paletas de Three.js ya preparadas.
- `!estilo haz que la bóveda lata y se vuelva roja` — Mimo interpreta palabras de color y movimiento y aplica el diseño permitido más cercano; no ejecuta CSS ni código del chat.
- `!reacciona` — pide una línea de Mimo basada en el contexto reciente.
- `!ayuda` — muestra la lista de comandos.
- En modo demo, `!canje pista`, `!canje estilo neon`, `!canje tema bosque` y `!canje mimo` simulan recompensas para probarlas sin conectar Twitch.

## Crear una sala con plantilla

1. Deja seleccionado **Plantilla · sin costo**.
2. Elige uno de los escenarios o escribe una situación propia. El texto libre se incorpora a la historia y el sistema elige una plantilla compatible; sus acertijos están listos y no requieren IA.
3. Pulsa **Crear sala** y revisa el dossier para ver el objetivo, los tres objetos y el primer comando.
4. En el chat, usa `!examinar [objeto]`, después `!resolver [objeto] [respuesta]` para cada pista y finalmente `!codigo [código]`.

Elige un límite de 3, 4 o 5 minutos antes de iniciar la sala. El contador comienza al crear o reiniciar la ronda; si llega a cero antes de abrir la bóveda, la partida queda fallida y el streamer puede reiniciarla.

La opción **IA · con créditos** permite seleccionar Gemini u OpenAI. La pantalla indica si falta la clave seleccionada y, si el proveedor rechaza la solicitud, Nexo entrega una plantilla y explica el motivo.

Los temas propuestos por el chat se revisan antes de crear una sala. Los usuarios no pueden enviar CSS ni código; solo pueden elegir entre los estilos permitidos. La participación repetida tiene enfriamiento.

## Archivos

- `server.mjs`: servidor Node, endpoints, generación de salas y conexiones Twitch por streamer.
- `multi-tenant-store.mjs`: PostgreSQL, aislamiento por canal, cifrado de tokens, eventos compartidos y arrendamientos de conexiones.
- `room-templates.mjs`: catálogo y construcción determinista de salas sin API.
- `app.js`: partida, comandos, Co-Caster y sincronización del overlay.
- `index.html`, `styles.css`, `enhancements.css`, `scene3d.js`: panel, escena 3D con Three.js y overlay OBS.
- `.env.example`: nombres de variables sin credenciales.
