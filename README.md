# Nexo — Escape Room del chat

Prototipo interactivo para el hackathon Codex x TwitchCon. Nexo convierte los mensajes del chat en acciones dentro de una sala de escape. El Co-Caster Mimo reacciona a los hallazgos y la participación comunitaria activa cambios visuales.

## Estado actual

Esta primera versión es una demo local, sin conexión a Twitch ni llamadas a modelos de IA. El chat simulado sirve para probar el ciclo de juego y el diseño del overlay antes de integrar Twitch Chat/EventSub y generación de salas.

La sala de demostración es **El Archivo Sumergido**. Hay tres pistas —reloj, estatua y antorcha— que revelan el código `241`.

## Ejecutar

Abre `index.html` directamente en el navegador. Si prefieres servirlo localmente:

```bash
python3 -m http.server 4173
```

Después visita `http://localhost:4173`.

## Comandos de demo

- `!examinar reloj`
- `!examinar estatua`
- `!examinar antorcha`
- `!codigo 241`
- `!pista`
- `!ayuda`

También puedes enviar mensajes normales. El control de efectos pausa las reacciones visuales del Co-Caster; el botón ↻ reinicia la partida.

## Siguiente etapa

1. Conectar Twitch Chat/EventSub y reemplazar el chat de simulación.
2. Añadir creación de salas mediante un modelo, con respuestas validadas contra un esquema seguro.
3. Configurar una vista de overlay para OBS separada del panel de control del streamer.
4. Ajustar comandos, cooldowns, moderación y ritmo de las reacciones con pruebas en un canal real.

El Co-Caster de la demo usa líneas locales preparadas; no se ejecuta código generado por los espectadores.
