# Guía de prueba de usuario — Nexo

Nexo convierte la sala del streamer en un escape room cooperativo. El streamer prepara el escenario; el chat busca pistas, resuelve acertijos, activa estilos visuales y hace reaccionar a Mimo, el Co-Caster.

## Enlaces

- Demo pública sin contraseña: https://twitch-pro.onrender.com/demo
- Panel privado del streamer: https://twitch-pro.onrender.com/ (inicia sesión con Twitch)
- Código de la versión desplegada: https://github.com/Martingon4/TWITCH-PRO/tree/codex/online-render

En la pantalla inicial, selecciona **ENTRAR COMO STREAMER CON TWITCH** si vas a preparar una aventura para tu canal. No necesitas estar transmitiendo. Si solo quieres probar el juego, pulsa **PROBAR COMO ESPECTADOR**; entrarás a la simulación sin iniciar sesión. Twitch puede mostrar afiliación/partner y estado en vivo para algunas cuentas, pero no identifica a todos los streamers.

La demo pública funciona como simulación local en el navegador. Usa plantillas gratuitas, no conecta una cuenta de Twitch, no llama a Gemini/OpenAI y no guarda el progreso. El panel principal usa autorización individual de Twitch para conectar el canal.

## A. Probar como espectador, sin instalar nada

1. Abre la demo pública.
2. Elige una de las ocho tarjetas de escenario o escribe una situación breve.
3. Pulsa **Crear sala**. Revisa el resumen, los objetos y el primer comando que recomienda la sala.
4. Escribe en el chat simulado el comando que aparece en pantalla. Usa los nombres y respuestas que muestra esta sala; cambian entre escenarios.
5. Prueba `!ayuda`, `!examinar [objeto]`, `!resolver [objeto] [respuesta]`, `!pista`, `!codigo [código]`, `!estilo [diseño]` y `!reacciona`.
6. Observa las pistas, el progreso del equipo, la bóveda, los efectos Three.js y las respuestas visuales de Mimo.

En esta página, los comandos no se publican en Twitch. Es una demo para que cualquiera pueda probar el concepto sin credenciales ni gasto de API.

## B. Probar como streamer, en Twitch

### Antes de comenzar

- Abre el panel principal y elige **ENTRAR COMO STREAMER CON TWITCH** para autorizar el canal.
- El dueño del canal de prueba debe tener acceso a la aplicación de Twitch y aprobar el flujo de código de dispositivo.
- Usa una segunda cuenta como espectador para escribir comandos reales en el chat del canal.
- Node.js 22+ y una instalación local solo hacen falta si se prueba desde el código fuente.

No publiques enlaces de overlay, códigos de activación, tokens ni claves de API. Los espectadores del directo participan desde el chat de Twitch; no necesitan iniciar sesión en Nexo.

### Conectar y empezar una partida

1. Abre https://twitch-pro.onrender.com/ y pulsa **ENTRAR COMO STREAMER CON TWITCH**. Abre Twitch Activate y autoriza los permisos de lectura solicitados.
2. Espera a que el panel muestre el canal conectado. La sesión queda ligada a esa cuenta de Twitch.
3. Elige un escenario o escribe una situación y pulsa **Crear sala**. El modo **Plantilla · gratis** no consume créditos. **IA · con créditos** usa el proveedor seleccionado y puede generar cargos/cuota.
4. Antes de iniciarla, selecciona el límite de 3, 4 o 5 minutos (4 por defecto). El contador y los avisos aparecen visualmente en la escena y en OBS al minuto, a los 30 y a los 10 segundos; Nexo no publica mensajes de aviso en el chat de Twitch. Si llega a cero, la ronda falla con un efecto rojo y el botón para reintentar.
5. En OBS, añade una **Fuente de navegador** y pega la URL privada que copia el botón de overlay del panel conectado. No uses `localhost` en OBS si Render aloja la app.
6. Desde la segunda cuenta de Twitch, prueba los comandos que aparecen en el panel, por ejemplo `!examinar [objeto]` y `!resolver [objeto] [respuesta]`.
7. Completa las tres pistas y escribe el código indicado por la sala para abrir la bóveda. Prueba también `!estilo ...`, `!reacciona` y `!tema ...`.

La propuesta `!tema ...` se envía al panel para que el streamer la revise; no crea una sala automáticamente. Mimo se muestra en el panel/overlay y no escribe mensajes en el chat de Twitch.

### Probar Gemini (opcional)

En el panel privado selecciona **IA · con créditos**, elige Gemini y escribe una situación concreta. La solicitud usa la clave configurada en Render y puede consumir cuota de Google. La demo pública no ofrece generación con IA. Si el proveedor falla, el panel indica el motivo y carga una plantilla.

### Probar puntos de canal (opcional)

El streamer debe crear en Twitch recompensas personalizadas con estos nombres exactos: `Nexo · Pista`, `Nexo · Estilo`, `Nexo · Tema` y `Nexo · Mimo`. Después de volver a autorizar permisos de canjes, prueba cada recompensa desde otra cuenta. Nexo escucha los canjes, pero no crea ni administra las recompensas.

## C. Probar aislamiento entre streamers (opcional)

1. Autoriza dos canales de prueba distintos, cada uno desde su propio panel/sesión.
2. Crea una sala y envía comandos en cada canal.
3. Comprueba que las salas, progreso y chat de cada canal no se mezclen.

La aplicación separa el estado por Twitch User ID y persiste los tokens cifrados en PostgreSQL. Cada streamer inicia sesión con su propia cuenta de Twitch. La API muestra afiliación/partner para algunas cuentas, pero no identifica a todos los streamers; por eso una cuenta offline o sin afiliación también puede elegir el flujo de streamer. Los espectadores usan la demo pública sin autorizar la aplicación.

## Lista de aceptación

- [ ] Una persona puede probar el flujo de sala en la demo pública sin iniciar sesión.
- [ ] El panel deja claro qué modo consume API y cuál usa plantillas gratuitas.
- [ ] El streamer conecta su canal de Twitch y el chat real llega al panel.
- [ ] Los comandos del chat actualizan la misma sala y abren la bóveda con el código correcto.
- [ ] El overlay de OBS refleja la sala conectada.
- [ ] El contador coincide en el panel y OBS, muestra avisos y permite ver una ronda completada o fallida.
- [ ] Mimo y los estilos hacen visible la participación sin ejecutar código enviado por espectadores.
- [ ] Dos canales de prueba mantienen salas y chat separados.
- [ ] Una persona puede explicar qué aporta Nexo después de probarlo.

## Incidencias

```text
Fecha / navegador:
Demo pública o panel streamer:
Paso que estaba probando:
Qué esperaba:
Qué ocurrió:
¿Se pudo repetir?:
Captura (oculta códigos, nombres privados y credenciales):
```

## Límites conocidos

- La demo pública es una simulación local, sin conexión Twitch ni persistencia.
- El panel de streamer requiere autorización individual de Twitch. Los espectadores usan la demo pública sin iniciar sesión.
- Las claves de IA pertenecen a la cuenta configurada en Render y las generaciones pueden consumir cuota.
- Los mensajes de chat enviados a Mimo pueden incluirse en el contexto de la API; no envíes información privada.
- Nexo facilita participación y contenido compartido, pero no demuestra por sí solo un aumento de audiencia o visualizaciones.
- El plan gratuito de Render puede dormir por inactividad y la base gratuita tiene límites de retención/recursos. Revisa las condiciones actuales antes de mantener la app después del hackathon.
