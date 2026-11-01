# Prueba de usuario: Nexo desde la perspectiva de un streamer

Esta guía permite que una persona pruebe Nexo como streamer, sin revisar el código. La prueba busca responder: **¿puede entender cómo conectar su canal, iniciar una sala y hacer que el chat participe durante la transmisión?**

## Qué estamos probando

Nexo es una experiencia de Escape Room cooperativo para Twitch. El streamer crea el reto y lo muestra en OBS; los espectadores participan desde el chat para descubrir pistas, abrir la bóveda, votar efectos visuales y pedir reacciones de Mimo.

La prueba se hace con **un canal** para validar el recorrido principal de principio a fin. No pretende demostrar todavía una plataforma con varios streamers conectados simultáneamente.

## Antes de empezar

Para la prueba en modo demo:

- Una computadora con Node.js 22 o posterior y conexión a internet.
- El proyecto descargado o clonado desde GitHub.
- No hace falta una cuenta de Twitch, una clave de OpenAI ni OBS para recorrer la interfaz y simular comandos.

Para probar Twitch en vivo, además:

- Una cuenta de Twitch que controle el canal de prueba y pueda autorizar la aplicación.
- El Client ID de una aplicación registrada en [Twitch Developer Console](https://dev.twitch.tv/console/apps).
- Idealmente, una segunda cuenta que actúe como espectador y escriba comandos en el chat.
- Para probar canjes, el canal debe tener puntos y recompensas personalizadas configuradas.

En esta versión, se debe autorizar la cuenta propietaria del canal que se va a probar. No conectes una cuenta de espectador como si fuera el canal del streamer.

La clave de OpenAI es opcional. Sin ella, Nexo usa una sala y reacciones de respaldo. **No compartas archivos `.env`, tokens ni secretos de Twitch u OpenAI**; cada tester debe guardar sus credenciales localmente. El flujo actual no necesita un Client Secret de Twitch.

## Preparar Nexo

En la carpeta del proyecto, ejecuta:

```bash
npm install
cp .env.example .env
```

Edita `.env` solo en la computadora de prueba:

```env
TWITCH_CLIENT_ID=el_client_id_de_la_aplicacion
```

Para habilitar la generación de salas y comentarios de Mimo con IA, agrega también una clave propia:

```env
OPENAI_API_KEY=tu_clave_local
OPENAI_MODEL=gpt-4.1-mini
```

Inicia el servidor:

```bash
npm start
```

Abre `http://localhost:4173` en el mismo equipo. No cierres la terminal mientras dure la prueba. Si el puerto ya está ocupado, detén el proceso anterior con `Ctrl+C` antes de volver a iniciar Nexo.

### Si Nexo ya está publicado en Render

El streamer y el tester abren la URL pública que te dio Render; no instalan Node ni ejecutan una terminal. Comparte la contraseña del panel por un medio privado. El streamer conecta la cuenta que controla el canal de prueba.

Para OBS, el streamer copia la URL del overlay con su `OVERLAY_TOKEN` desde la configuración del servicio. Esa URL es privada; no la incluyas en mensajes públicos ni capturas. Render gratuito puede tardar en responder después de un periodo sin tráfico, y un reinicio del servicio requiere volver a conectar Twitch.

## Guion de la prueba

Pídele al tester que piense en voz alta y no le expliques los controles de antemano. Observa dónde duda y anota sus palabras.

### A. Primera impresión

1. Abre `http://localhost:4173`.
2. Pregunta: “¿Qué crees que hace esta herramienta y qué harías primero para usarla en tu stream?”
3. Comprueba si identifica que el chat juega en equipo y que el streamer prepara la sala.

**Se espera:** que entienda la propuesta desde el panel y encuentre el control para conectar Twitch y crear una sala.

### B. Crear una sala

1. Escribe un tema en el campo de creación, por ejemplo: `una estación espacial abandonada`.
2. Pulsa **Crear sala**.
3. Observa el título, el texto de apertura y el cambio visual del ambiente.

**Se espera:** que aparezca una sala jugable. Con OpenAI configurado se indica que la sala proviene de IA; sin clave, se usa la plantilla de respaldo.

### C. Jugar en modo demo

Usa el campo de chat que aparece dentro del panel. Ese campo simula participantes locales; **no publica mensajes en Twitch**.

Prueba estos comandos, uno por uno:

```text
!ayuda
!examinar reloj
!examinar estatua
!examinar antorcha
!codigo 241
```

El código correcto puede variar si se generó una sala con IA. En ese caso, usa las cifras que aparecen en las tres pistas y escríbelas en el orden reloj, estatua, antorcha.

Luego prueba:

```text
!estilo neon
!reacciona
!canje pista
!canje estilo ambar
!canje tema bosque
!canje mimo
```

**Se espera:** pistas visibles en la escena, progreso compartido, apertura de la bóveda, cambios de estilo y una reacción de Mimo. Las propuestas `!tema` y `!canje tema ...` deben quedar para que el streamer las revise; no inician una sala por sí solas.

### D. Conectar Twitch (prueba en vivo, opcional)

1. Pulsa **Conectar Twitch**.
2. Abre el enlace de activación, ingresa el código mostrado y autoriza los permisos solicitados.
3. Espera a que el estado cambie a **Twitch · nombre_de_cuenta** o a **Chat conectado**.
4. Desde otra cuenta, envía `!ayuda` o `!examinar reloj` en el chat del canal autorizado.

**Se espera:** que el mensaje real aparezca en el panel y que el comando afecte la misma sala. Escribir en el simulador local del panel no sirve para comprobar Twitch.

Si el estado dice **Chat de Twitch** en vez de **Chat + puntos**, la lectura del chat funciona, pero los canjes no quedaron disponibles. Eso no impide jugar con comandos.

### E. Verlo como espectador en OBS (opcional)

En OBS, agrega una **Fuente de navegador** con:

```text
http://localhost:4173/?overlay=1
```

Usa el mismo equipo donde se ejecuta Nexo. Interactúa con la sala desde el panel o con comandos reales de Twitch y comprueba que la escena del overlay refleje los cambios.

### F. Probar recompensas de puntos (opcional)

En el panel de Twitch del canal de prueba, crea manualmente recompensas personalizadas con estos títulos exactos:

- `Nexo · Pista`
- `Nexo · Estilo`
- `Nexo · Tema`
- `Nexo · Mimo`

Para `Nexo · Estilo`, configura el mensaje para que el espectador escriba `neon`, `ambar` o `bruma`. Para `Nexo · Tema`, pide una idea de sala. Canjea cada recompensa y anota si la acción esperada ocurre. Nexo escucha estos canjes, pero no crea ni administra las recompensas de Twitch.

## Lista de aceptación

Marca cada punto como **Sí**, **No** o **No probado**:

- [ ] Entendí en menos de un minuto qué aporta Nexo a mi transmisión.
- [ ] Pude encontrar cómo crear una sala y completar el reto.
- [ ] Entendí qué hacen los comandos y dónde escribirlos.
- [ ] La escena y las reacciones de Mimo hicieron visible la participación del chat.
- [ ] Pude distinguir el chat simulado del chat real de Twitch.
- [ ] Pude conectar Twitch o entendí qué dato faltaba para hacerlo.
- [ ] Pude encontrar cómo mostrar la escena en OBS.
- [ ] Usaría esta dinámica durante una transmisión. ¿Por qué?

## Formato para reportar resultados

Completa y devuelve esta sección junto con capturas si ayudan a explicar un problema. Antes de compartir capturas, oculta códigos de activación, tokens, correos y cualquier credencial.

```text
Tester / fecha:
Modo: demo / Twitch en vivo / OBS
Canal de prueba (opcional):
Sistema y navegador:

¿Qué pensaste que hacía Nexo antes de probarlo?
¿En qué paso dudaste o te detuviste?
¿Qué parte fue más útil para tu stream?
¿Qué parte no usarías o cambiarías?
¿Volverías a usarlo en otra transmisión? ¿Por qué?

Problema observado:
Pasos para reproducirlo:
Qué esperabas:
Qué ocurrió:
Captura (sin credenciales):
```

## Límites de esta versión

- Conecta un canal por instancia local; no administra varios streamers a la vez.
- El token de Twitch vive en memoria y se pierde cuando se apaga el servidor; habrá que conectar de nuevo al reiniciar.
- Mimo aparece como Co-Caster visual; no envía mensajes al chat ni habla con voz.
- Los estilos del chat están limitados a neón, ámbar y bruma; el chat no ejecuta CSS o código.
- Las propuestas de tema requieren que el streamer las revise y pulse **Crear sala**.
- La prueba mide si la experiencia se entiende y genera participación. No demuestra por sí sola un aumento de audiencia o visualizaciones.
