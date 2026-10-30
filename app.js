(() => {
  const $ = (id) => document.getElementById(id);
  const chatMessages = $("chatMessages");
  const input = $("chatInput");
  const state = { clues: {}, energy: 12, opened: false, effects: true, messages: 0, toastTimer: null, eventTimer: null, captionTimer: null };
  const users = [
    { name: "pixelpirata", avatar: "P", color: "coral" },
    { name: "luna.exe", avatar: "L", color: "violet" },
    { name: "cafeyboss", avatar: "C", color: "gold" },
    { name: "m4rte", avatar: "M", color: "blue" },
    { name: "n0cturna", avatar: "N", color: "" },
  ];
  const clueData = {
    reloj: { key: "clock", digit: "2", status: "HORA · 02", slot: "slotOne", display: "clockStatus", label: "HORA", caption: "El reloj se detuvo a las 02:00. Primera cifra: 2." },
    estatua: { key: "statue", digit: "4", status: "PIEDRA · IV", slot: "slotTwo", display: "statueStatus", label: "PIEDRA", caption: "La estatua sostiene cuatro dedos. Segunda cifra: 4." },
    antorcha: { key: "torch", digit: "1", status: "LLAMA · I", slot: "slotThree", display: "torchStatus", label: "LLAMA", caption: "Solo una antorcha sigue encendida. Tercera cifra: 1." },
  };
  const openingLines = [
    "Esa puerta lleva cerrada más tiempo que mi última buena predicción.",
    "¡Se movió! Chat, oficialmente tienen más fuerza que el streamer.",
    "La bóveda cedió. Voy a fingir que lo tenía calculado.",
  ];
  const casterLines = {
    inspect: ["Una pista más. El chat está haciendo el trabajo de detective que nadie le pidió al streamer.", "¡Buen ojo! A este ritmo, la sala se queda sin secretos antes que el canal sin teorías."],
    wrong: ["Ese código no abrió nada. La puerta juzga en silencio, yo no tanto.", "Casi… si la bóveda tuviera sentimientos, ahora estaría un poco decepcionada."],
    progress: ["La energía sube. ¿Quién diría que escribir en mayúsculas servía para algo?", "¡Efecto desbloqueado! El chat acaba de mejorar la iluminación. El presupuesto era imaginario."],
    hint: ["Pista para el equipo: miren los detalles que parecen demasiado obvios.", "No es por presionar, pero hay una estatua que lleva rato esperando atención."],
    idle: ["Tres pistas, una puerta y cientos de expertos en el chat. ¿Qué podría salir mal?", "El silencio de la bóveda es inquietante. El del chat, más."],
  };
  const initialMessages = [
    { user: "pixelpirata", color: "coral", text: "entramos al archivo 👀" },
    { user: "luna.exe", color: "violet", text: "esa puerta está enorme" },
    { user: "cafeyboss", color: "gold", text: "!examinar reloj", command: true },
    { user: "m4rte", color: "blue", text: "yo voy por la estatua" },
    { user: "n0cturna", color: "", text: "chat detective en 3... 2..." },
    { user: "pixelpirata", color: "coral", text: "¿vieron el símbolo de la puerta?" },
  ];

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function addMessage({ user, color = "", text, system = false, caster = false, highlight = false, good = false, command = false }) {
    const row = document.createElement("div");
    row.className = `message${system ? " system" : ""}${caster ? " caster-message" : ""}${highlight ? " highlight" : ""}${good ? " good" : ""}`;
    const initials = caster ? "✦" : system ? "✦" : escapeHTML(user.slice(0, 1).toUpperCase());
    const safeUser = escapeHTML(user);
    const content = command ? `<span class="command">${escapeHTML(text)}</span>` : escapeHTML(text);
    row.innerHTML = `<span class="message-avatar ${escapeHTML(color)}${caster ? " caster-mini" : ""}">${initials}</span><div class="message-content"><div class="message-line"><span class="message-name${system ? " mod" : ""}">${safeUser}</span><span class="message-time">${new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false })}</span></div><div class="message-text">${content}</div></div>`;
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    while (chatMessages.children.length > 70) chatMessages.removeChild(chatMessages.firstChild);
    state.messages += 1;
    $("momentCount").textContent = String(Math.floor(state.messages / 4));
  }

  function setCaster(text, addToChat = true) {
    $("casterLine").textContent = text;
    const card = $("casterCard");
    card.classList.remove("pop", "quiet");
    if (!state.effects) card.classList.add("quiet");
    void card.offsetWidth;
    card.classList.add("pop");
    if (addToChat && state.effects) addMessage({ user: "MIMO · CO-CASTER", text, caster: true });
  }

  function randomLine(type) {
    const lines = casterLines[type] || casterLines.idle;
    return lines[Math.floor(Math.random() * lines.length)];
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2500);
  }

  function showEvent(message) {
    const event = $("chatEvent");
    event.lastElementChild.textContent = message;
    event.classList.add("visible");
    window.clearTimeout(state.eventTimer);
    state.eventTimer = window.setTimeout(() => event.classList.remove("visible"), 2600);
  }

  function showCaption(message) {
    const caption = $("sceneCaption");
    caption.lastElementChild.textContent = message;
    caption.classList.add("visible");
    window.clearTimeout(state.captionTimer);
    state.captionTimer = window.setTimeout(() => caption.classList.remove("visible"), 4200);
  }

  function updateEnergy(amount) {
    if (state.opened) return;
    const before = state.energy;
    state.energy = Math.min(100, state.energy + amount);
    $("energyValue").textContent = String(state.energy);
    $("energyFill").style.width = `${state.energy}%`;
    const scene = $("scene");
    const thresholds = [35, 65, 90];
    thresholds.forEach((threshold, index) => {
      if (state.energy >= threshold) scene.classList.add(`energy-${threshold}`);
      if (before < threshold && state.energy >= threshold) {
        showEvent(["¡Lámparas activadas!", "¡La sala revela nuevos detalles!", "¡El chat cargó un pulso de energía!"][index]);
        if (index === 0) setCaster(randomLine("progress"));
        else if (state.effects) showToast(["Efecto desbloqueado: luces de la sala", "Efecto desbloqueado: visión submarina", "Efecto desbloqueado: pulso final"][index]);
      }
    });
    const next = thresholds.find((threshold) => state.energy < threshold);
    $("nextUnlock").textContent = next ? `Siguiente efecto · ${next}%` : "¡Todos los efectos activos!";
  }

  function revealClue(objectName, user) {
    const clue = clueData[objectName];
    if (!clue) {
      showCaption("No encuentras eso. Prueba reloj, estatua o antorcha.");
      showToast("Objeto no encontrado · reloj / estatua / antorcha");
      return;
    }
    if (state.clues[clue.key]) {
      addMessage({ user: "Sistema", text: `${user} volvió a mirar ${objectName}. La pista ya está en el tablero.`, system: true });
      showCaption(`Pista ya descubierta: ${clue.label} = ${clue.digit}.`);
      return;
    }
    state.clues[clue.key] = true;
    $(clue.display).textContent = clue.status;
    $(`clue${clue.key[0].toUpperCase()}${clue.key.slice(1)}`).classList.add("found");
    $(clue.slot).classList.add("active");
    $(clue.slot).querySelector("i").textContent = clue.digit;
    const clueCount = Object.keys(state.clues).length;
    $("clueCount").textContent = String(clueCount);
    $("lockDisplay").textContent = Object.keys(clueData).map((key) => {
      const item = clueData[key];
      return state.clues[item.key] ? item.digit : "•";
    }).join(" ");
    addMessage({ user: "Sistema", text: `${user} descubrió una pista: ${clue.label} = ${clue.digit}.`, system: true, good: true });
    addMessage({ user, color: "gold", text: `!examinar ${objectName}`, command: true, good: true });
    showCaption(clue.caption);
    showEvent(`Pista encontrada · ${clue.label} = ${clue.digit}`);
    updateEnergy(16);
    if (clueCount === 3) {
      $("slotCode").classList.add("active");
      $("slotCode").querySelector("i").textContent = "2 4 1";
      $("sceneHint").textContent = "¡Código completo! Escríbanlo para abrir la bóveda: !codigo 241";
      showToast("Todas las pistas reunidas · el código es 241");
      setCaster("Tres pistas. El chat ya resolvió el misterio; ahora falta que alguien escriba los números en orden.");
    } else {
      setCaster(randomLine("inspect"));
    }
  }

  function openVault(user) {
    if (state.opened) {
      addMessage({ user: "Sistema", text: "La bóveda ya está abierta. El chat se ganó su momento de gloria.", system: true });
      return;
    }
    const found = Object.keys(state.clues).length;
    if (found < 3) {
      addMessage({ user, color: "coral", text: "!codigo 241", command: true });
      addMessage({ user: "Sistema", text: `Faltan ${3 - found} pista${3 - found === 1 ? "" : "s"}. Examinen los objetos antes de probar el código.`, system: true });
      showCaption("La bóveda no cede. Primero hay que descubrir las tres pistas.");
      setCaster(randomLine("wrong"));
      updateEnergy(5);
      return;
    }
    state.opened = true;
    $("scene").classList.add("open");
    $("lockDisplay").textContent = "2 4 1";
    $("successOverlay").classList.add("visible");
    $("sceneHint").textContent = "La bóveda se abrió. ¡El equipo completó la misión!";
    addMessage({ user, color: "blue", text: "!codigo 241", command: true, good: true });
    addMessage({ user: "Sistema", text: `${user} encontró el código. ¡La bóveda se abre!`, system: true, good: true });
    showEvent("¡BÓVEDA ABIERTA! · MISIÓN COMPLETADA");
    setCaster(openingLines[Math.floor(Math.random() * openingLines.length)]);
    $("slotCode").classList.add("active");
    $("slotCode").querySelector("i").textContent = "✓";
  }

  function processCommand(text, user) {
    const cleaned = text.trim();
    const match = cleaned.match(/^!(\S+)(?:\s+(.+))?$/i);
    if (!match) {
      addMessage({ user, color: users.find((entry) => entry.name === user)?.color || "", text: cleaned });
      if (/\b(f|jaj|xd|lol|gg)\b/i.test(cleaned) && state.effects) setCaster("El chat ya está celebrando. La bóveda sigue cerrada, pero el ánimo está por las nubes.", false);
      return;
    }
    const command = match[1].toLowerCase();
    const args = (match[2] || "").trim();
    if (command === "examinar" || command === "mirar") {
      if (!args) {
        addMessage({ user, color: "gold", text: cleaned, command: true });
        addMessage({ user: "Sistema", text: "Indica un objeto: reloj, estatua o antorcha.", system: true });
        return;
      }
      revealClue(args.toLowerCase().replace(/[.!?]+$/, ""), user);
      return;
    }
    if (command === "codigo" || command === "código") {
      if (args.replace(/\s/g, "") === "241") openVault(user);
      else {
        addMessage({ user, color: "coral", text: cleaned, command: true });
        addMessage({ user: "Sistema", text: "Ese código no funcionó. Busca las pistas en la sala.", system: true });
        showCaption("La cerradura no reconoce esa combinación.");
        setCaster(randomLine("wrong"));
        updateEnergy(4);
      }
      return;
    }
    if (command === "pista") {
      addMessage({ user, color: "violet", text: cleaned, command: true });
      const missing = Object.values(clueData).find((clue) => !state.clues[clue.key]);
      if (missing) {
        const suggestions = { reloj: "Una hora exacta se quedó detenida aquí.", estatua: "La respuesta está en los dedos de piedra.", antorcha: "Cuenta las llamas que siguen encendidas." };
        showCaption(suggestions[Object.keys(clueData).find((key) => clueData[key] === missing)]);
        setCaster(randomLine("hint"));
      } else showCaption("Ya tienen todas las pistas. ¡Prueben el código 241!");
      updateEnergy(6);
      return;
    }
    if (command === "ayuda" || command === "help") {
      addMessage({ user, color: "blue", text: cleaned, command: true });
      addMessage({ user: "Sistema", text: "Comandos: !examinar reloj / estatua / antorcha · !pista · !codigo 241", system: true });
      showToast("Comandos mostrados en el chat");
      return;
    }
    if (command === "votar") {
      addMessage({ user, color: "gold", text: cleaned, command: true });
      updateEnergy(5);
      showEvent(`${user} se unió al esfuerzo del equipo`);
      return;
    }
    addMessage({ user, color: "coral", text: cleaned, command: true });
    addMessage({ user: "Sistema", text: `Comando !${escapeHTML(command)} desconocido. Prueba !ayuda.`, system: true });
  }

  function seedChat() {
    initialMessages.forEach((message, index) => {
      window.setTimeout(() => addMessage({ ...message, user: message.user }), index * 170);
    });
    window.setTimeout(() => {
      addMessage({ user: "MIMO · CO-CASTER", text: "A ver, equipo. Tres pistas, una puerta y cero presión… bueno, casi.", caster: true });
    }, initialMessages.length * 170 + 150);
  }

  function sendMessage(text, user = "tú") {
    const cleaned = text.trim();
    if (!cleaned) return;
    processCommand(cleaned, user);
  }

  $("chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
    input.value = "";
    input.focus();
  });
  document.querySelectorAll("[data-command]").forEach((button) => button.addEventListener("click", () => {
    input.value = button.dataset.command;
    input.focus();
  }));
  $("effectsButton").addEventListener("click", () => {
    state.effects = !state.effects;
    $("effectsButton").classList.toggle("off", !state.effects);
    $("effectsButton").querySelector(".toggle-on").textContent = state.effects ? "ON" : "OFF";
    $("scene").classList.toggle("effects-off", !state.effects);
    showToast(state.effects ? "Efectos del chat activados" : "Efectos del chat pausados");
  });
  $("resetButton").addEventListener("click", resetGame);
  $("nextRoomButton").addEventListener("click", resetGame);
  $("fullscreenButton").addEventListener("click", async () => {
    const target = $("gameFrame");
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await target.requestFullscreen();
    } catch {
      showToast("Pantalla completa no disponible en este navegador");
    }
  });

  function resetGame() {
    state.clues = {};
    state.energy = 12;
    state.opened = false;
    $("scene").classList.remove("open", "energy-35", "energy-65", "energy-90");
    $("successOverlay").classList.remove("visible");
    $("sceneHint").textContent = "Pista colectiva: examina los objetos para reunir el código.";
    $("clueCount").textContent = "0";
    $("energyValue").textContent = "12";
    $("energyFill").style.width = "12%";
    $("nextUnlock").textContent = "Siguiente efecto · 35%";
    $("lockDisplay").textContent = "● ● ●";
    Object.values(clueData).forEach((clue) => {
      $(clue.display).textContent = "SIN EXAMINAR";
      $(`clue${clue.key[0].toUpperCase()}${clue.key.slice(1)}`).classList.remove("found");
      $(clue.slot).classList.remove("active");
      $(clue.slot).querySelector("i").textContent = "?";
    });
    $("slotCode").classList.remove("active");
    $("slotCode").querySelector("i").textContent = "•••";
    chatMessages.innerHTML = "";
    state.messages = 0;
    $("momentCount").textContent = "0";
    addMessage({ user: "Sistema", text: "Nueva partida iniciada. Chat, la bóveda está lista.", system: true });
    setCaster("Nueva sala, misma oportunidad para que el chat salve al streamer.", false);
    seedChat();
    showToast("Sala reiniciada · nueva partida en marcha");
  }

  seedChat();
})();
