# Guion bilingüe del video de Nexo

Duración objetivo: **2:40–2:50**. El hackathon pide un video de menos de tres minutos que muestre el proyecto funcionando con Twitch y cómo se usó Codex; debe publicarse en YouTube con visibilidad pública. Revisa los requisitos actuales en la [página oficial del hackathon](https://twitchcon-codex.devpost.com/).

## Cómo grabarlo

La opción más natural es **narrar en español y poner subtítulos en inglés**. Lee solo la columna en español. La columna en inglés es una traducción fiel para los subtítulos; no leas los dos idiomas en voz alta. Mantén los subtítulos sincronizados con cada bloque y reemplaza los corchetes por nombres que aparezcan en tu partida real.

Graba con un canal Twitch de prueba y una segunda cuenta para enviar los comandos. En la parte de Twitch, muestra mensajes reales del chat y el cambio correspondiente en Nexo/OBS; la ruta `/demo` es una simulación local y no sirve para demostrar la conexión. Para la parte de Codex, muestra el hilo y fragmentos de código sin enseñar claves, tokens, códigos de autorización, correo ni URL privada del overlay.

## Guion y plano por plano

### 0:00–0:18 — El problema y la idea

**Muestra:** Twitch con el canal de prueba, luego el nombre de Nexo. Evita música con derechos.

**Narración en español:**

> En un chat rápido, muchos mensajes pasan antes de que el streamer pueda leerlos. Nexo convierte esa conversación en una misión compartida: el chat investiga, resuelve pistas y abre una bóveda durante el directo.

**English subtitles:**

> In a fast-moving chat, many messages pass before the streamer can read them. Nexo turns that conversation into a shared mission: viewers investigate, solve clues, and open a vault during the stream.

### 0:18–0:43 — El streamer prepara la sala

**Muestra:** Pantalla de bienvenida de Nexo, elección de streamer, panel conectado y selección de una plantilla. No muestres códigos de autorización.

**Narración en español:**

> El streamer inicia sesión con Twitch, elige una aventura y agrega el overlay de Nexo a OBS. Puede empezar con una plantilla gratuita, sin configurar una API de inteligencia artificial.

**English subtitles:**

> The streamer signs in with Twitch, chooses an adventure, and adds the Nexo overlay to OBS. They can start with a free template, without setting up an AI API.

### 0:43–1:23 — El chat juega en Twitch

**Muestra:** En el canal real, un espectador usa `!examinar [objeto]`; enseña la pista que aparece. Luego muestra `!resolver [objeto] [respuesta correcta]` y el dígito que se revela. Usa una respuesta verificada de esa sala. Si el tiempo alcanza, enseña `!codigo [código]` y la animación de apertura.

**Narración en español:**

> Los espectadores no necesitan otra cuenta en Nexo: participan desde el chat de Twitch. Aquí alguien examina [nombre del objeto] y encuentra un acertijo. Otro espectador propone [respuesta correcta]. La sala valida la solución y revela una cifra. Al reunir la combinación, el chat puede abrir la bóveda.

**English subtitles:**

> Viewers do not need another Nexo account: they participate through Twitch chat. Here, someone examines [object name] and finds a riddle. Another viewer suggests [correct answer]. The room checks the solution and reveals a digit. Once the team has the combination, chat can open the vault.

### 1:23–1:50 — La experiencia visual y Mimo

**Muestra:** La misma sala en OBS, comando real `!estilo [estilo permitido]`, cambio de color/animación, luego `!reacciona` y la respuesta visual de Mimo.

**Narración en español:**

> La participación también cambia lo que se ve en pantalla. El chat activa estilos visuales seguros y puede pedir una reacción de Mimo, el Co-Caster visual de Nexo. Así, las acciones del público se reflejan en el directo.

**English subtitles:**

> Participation also changes what viewers see on screen. Chat can activate safe visual styles and request a reaction from Mimo, Nexo's visual Co-Caster. That way, audience actions show up in the stream.

### 1:50–2:15 — Por qué ayuda al streamer

**Muestra:** Progreso del equipo, pistas, overlay, Mimo; si alcanza, enseña rápidamente otra tarjeta de escenario.

**Narración en español:**

> Nexo le da al streamer una actividad que puede adaptar a distintos temas y comunidades. En vez de que cada mensaje quede aislado, los espectadores colaboran para avanzar en una misma historia. El objetivo es hacer más visible y entretenida la participación del chat.

**English subtitles:**

> Nexo gives streamers an activity they can adapt to different themes and communities. Instead of each message standing alone, viewers work together to move one story forward. The goal is to make chat participation more visible and entertaining.

### 2:15–2:45 — Cómo se construyó con Codex

**Muestra:** El hilo de Codex y un recorrido breve por cambios de integración Twitch/EventSub, el flujo de la sala y el overlay Three.js. Oculta cualquier dato privado.

**Narración en español:**

> Construimos Nexo con OpenAI Codex. Codex nos ayudó a planear los flujos para streamers y espectadores, desarrollar la conexión con Twitch, implementar los acertijos y mejorar el overlay visual. Probamos la experiencia y ajustamos el producto a partir de los comentarios de usuarios. Nexo: una aventura creada por el streamer y resuelta en comunidad.

**English subtitles:**

> We built Nexo with OpenAI Codex. Codex helped us plan the streamer and viewer flows, develop the Twitch connection, implement the puzzles, and improve the visual overlay. We tried the experience and refined the product based on user feedback. Nexo: an adventure created by the streamer and solved together.

## Antes de subirlo

- Mantén el video final debajo de **3:00**; apunta a 2:40–2:50 para tener margen.
- Demuestra un comando que llegue desde un chat real de Twitch y el cambio correspondiente en Nexo/OBS.
- Muestra Codex en pantalla y explica su papel con honestidad.
- Sustituye todos los textos entre corchetes por nombres/respuestas reales de la sala que grabes.
- Añade subtítulos en inglés sincronizados con la narración en español.
- Oculta contraseñas, claves de API, tokens, códigos de autorización, correo y URL privada del overlay.
- Usa solo imágenes, música y recursos de los que tengas permiso para publicar.
- Sube a YouTube como **Público** y abre el enlace en una ventana privada para revisar que se reproduzca.
