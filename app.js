(() => {
  const $ = (id) => document.getElementById(id);
  const syncThreeScene = (event, detail = {}) => window.dispatchEvent(new CustomEvent(`nexo:${event}`, { detail }));
  const pageParams = new URLSearchParams(location.search);
  const overlayMode = pageParams.get("overlay") === "1";
  function apiPath(path) {
    if (!overlayMode || !pageParams.has("key")) return path;
    const url = new URL(path, location.href);
    url.searchParams.set("key", pageParams.get("key"));
    return `${url.pathname}${url.search}`;
  }
  const chatMessages = $("chatMessages");
  const input = $("chatInput");
  const objectMeta = {
    reloj: { key: "clock", slot: "slotOne", display: "clockStatus", card: "clueClock", label: "HORA" },
    estatua: { key: "statue", slot: "slotTwo", display: "statueStatus", card: "clueStatue", label: "PIEDRA" },
    antorcha: { key: "torch", slot: "slotThree", display: "torchStatus", card: "clueTorch", label: "LLAMA" },
  };
  const fallbackRoom = {
    title: "El Archivo Sumergido",
    theme: "archivo submarino",
    environment: "underwater",
    summary: "Una cámara sellada esconde un secreto. El chat debe reunir tres cifras y escapar en equipo.",
    opening: "Una cámara sellada esconde un secreto. El chat debe reunir tres cifras y escapar en equipo.",
    clues: {
      reloj: { name: "RELOJ", digit: "2", answer: "2", riddle: "En el panel del reloj aparece (18 ÷ 3) − 4. ¿Qué cifra resulta?", hint: "Resuelve primero la división y luego resta 4.", caption: "Resuelve el acertijo del reloj." },
      estatua: { name: "ESTATUA", digit: "4", answer: "4", riddle: "La estatua protege una caja con (3 × 6) − 14 sellos. ¿Cuántos quedan?", hint: "Multiplica 3 por 6 antes de restar 14.", caption: "Resuelve el acertijo de la estatua." },
      antorcha: { name: "ANTORCHA", digit: "1", answer: "1", riddle: "La antorcha muestra (20 ÷ 2) − 9 marcas. ¿Cuántas quedan encendidas?", hint: "Divide 20 entre 2 y luego resta 9.", caption: "Resuelve el acertijo de la antorcha." },
    },
    code: "241",
    source: "plantilla",
  };
  const state = {
    clues: {}, examined: {}, energy: 12, opened: false, effects: true, messages: 0, room: fallbackRoom,
    participants: new Set(), contributionTimes: new Map(), chatContext: [],
    serverAvailable: false, aiEnabled: false, twitchConfigured: false, twitchStatus: "disconnected",
    eventSource: null, devicePoll: null, toastTimer: null, eventTimer: null, captionTimer: null,
    currentPreset: "bruma", lastRoomKey: "", casterBusy: false, styleVotes: new Map(),
  };
  const users = [
    { name: "pixelpirata", avatar: "P", color: "coral" },
    { name: "luna.exe", avatar: "L", color: "violet" },
    { name: "cafeyboss", avatar: "C", color: "gold" },
    { name: "m4rte", avatar: "M", color: "blue" },
    { name: "n0cturna", avatar: "N", color: "" },
  ];
  const casterLines = {
    inspect: ["Una pista más. El chat está haciendo el trabajo de detective que nadie le pidió al streamer.", "¡Buen ojo! A este ritmo, la sala se queda sin secretos antes que el canal sin teorías."],
    wrong: ["Ese código no abrió nada. La puerta juzga en silencio, yo no tanto.", "Casi… si la bóveda tuviera sentimientos, ahora estaría un poco decepcionada."],
    progress: ["La energía sube. ¿Quién diría que escribir en mayúsculas servía para algo?", "¡Efecto desbloqueado! El chat acaba de mejorar la iluminación. El presupuesto era imaginario."],
    hint: ["Pista para el equipo: miren los detalles que parecen demasiado obvios.", "No es por presionar, pero hay una estatua que lleva rato esperando atención."],
    room: ["Nueva sala, nuevo misterio y el chat ya viene con teorías de sobra.", "Una habitación recién salida del generador. Mimo recomienda mirar antes de tocar."],
    idle: ["Tres pistas, una puerta y cientos de expertos en el chat. ¿Qué podría salir mal?", "El silencio de la bóveda es inquietante. El del chat, más."],
  };
  const initialMessages = [
    { user: "pixelpirata", color: "coral", text: "entramos al archivo 👀" },
    { user: "luna.exe", color: "violet", text: "esa puerta está enorme" },
    { user: "cafeyboss", color: "gold", text: "la cerradura tiene tres ranuras" },
    { user: "m4rte", color: "blue", text: "yo voy por la estatua" },
    { user: "n0cturna", color: "", text: "chat detective en 3... 2..." },
    { user: "pixelpirata", color: "coral", text: "¿vieron el símbolo de la puerta?" },
  ];

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  async function api(path, options = {}) {
    const response = await fetch(apiPath(path), { ...options, headers: { "content-type": "application/json", ...(options.headers || {}) } });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.error || `La solicitud falló (${response.status}).`);
    return body;
  }

  function addMessage({ user = "chat", color = "", text = "", system = false, caster = false, highlight = false, good = false, command = false, source = "demo" }) {
    const safeText = String(text).slice(0, 180);
    const row = document.createElement("div");
    row.className = `message${system ? " system" : ""}${caster ? " caster-message" : ""}${highlight ? " highlight" : ""}${good ? " good" : ""}`;
    const initials = caster || system ? "✦" : escapeHTML(String(user).slice(0, 1).toUpperCase());
    const content = command ? `<span class="command">${escapeHTML(safeText)}</span>` : escapeHTML(safeText);
    row.innerHTML = `<span class="message-avatar ${escapeHTML(color)}${caster ? " caster-mini" : ""}">${initials}</span><div class="message-content"><div class="message-line"><span class="message-name${system ? " mod" : ""}">${escapeHTML(user)}</span><span class="message-time">${new Date().toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit", hour12: false })}${source === "twitch" ? " · TWITCH" : ""}</span></div><div class="message-text">${content}</div></div>`;
    chatMessages.appendChild(row);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    while (chatMessages.children.length > 70) chatMessages.removeChild(chatMessages.firstChild);
    state.messages += 1;
    $("momentCount").textContent = String(Math.floor(state.messages / 4));
    if (!system && !caster) state.chatContext.push({ user: String(user).slice(0, 24), text: safeText });
    if (state.chatContext.length > 18) state.chatContext.shift();
    if (!system && !caster) state.participants.add(String(user).toLocaleLowerCase("es"));
    updateParticipantCount();
  }

  function updateParticipantCount() {
    const count = state.participants.size;
    $("viewerCount").textContent = String(count);
    $("chatOnline").textContent = String(count);
  }

  function setCaster(text, addToChat = true, source = "demo") {
    const safeLine = String(text || "").replace(/[<>\u0000-\u001f]/g, " ").trim().slice(0, 180);
    if (!safeLine) return;
    $("casterLine").textContent = safeLine;
    $("casterModeTag").textContent = source === "openai" ? "· IA" : source === "plantilla" ? "· RESPALDO" : "· DEMO";
    $("casterCard").classList.toggle("caster-ai", source === "openai");
    const card = $("casterCard");
    card.classList.remove("pop", "quiet");
    if (!state.effects) card.classList.add("quiet");
    void card.offsetWidth;
    card.classList.add("pop");
    if (addToChat && state.effects) addMessage({ user: "MIMO · CO-CASTER", text: safeLine, caster: true });
  }

  function randomLine(type) {
    const lines = casterLines[type] || casterLines.idle;
    return lines[Math.floor(Math.random() * lines.length)];
  }

  async function requestCaster(trigger) {
    if (state.casterBusy) return;
    state.casterBusy = true;
    try {
      const result = await api("/api/caster", { method: "POST", body: JSON.stringify({ trigger, context: state.chatContext.slice(-8) }) });
      state.serverAvailable = true;
      setCaster(result.line, true, result.source || "openai");
    } catch {
      setCaster(randomLine(trigger), true, "plantilla");
    } finally {
      state.casterBusy = false;
    }
  }

  function showToast(message) {
    const toast = $("toast");
    toast.textContent = message;
    toast.classList.add("show");
    window.clearTimeout(state.toastTimer);
    state.toastTimer = window.setTimeout(() => toast.classList.remove("show"), 2800);
  }

  function showEvent(message) {
    const event = $("chatEvent");
    event.lastElementChild.textContent = message;
    event.classList.add("visible");
    window.clearTimeout(state.eventTimer);
    state.eventTimer = window.setTimeout(() => event.classList.remove("visible"), 2800);
  }

  function showCaption(message) {
    const caption = $("sceneCaption");
    caption.lastElementChild.textContent = String(message).slice(0, 180);
    caption.classList.add("visible");
    window.clearTimeout(state.captionTimer);
    state.captionTimer = window.setTimeout(() => caption.classList.remove("visible"), 4500);
  }

  function rewardUser(user, points, cooldown = 0) {
    const key = String(user).toLocaleLowerCase("es");
    const now = Date.now();
    const previous = state.contributionTimes.get(key) || 0;
    if (cooldown && now - previous < cooldown) return false;
    state.contributionTimes.set(key, now);
    updateEnergy(points);
    return true;
  }

  function updateEnergy(amount) {
    if (state.opened) return;
    const before = state.energy;
    state.energy = Math.min(100, state.energy + amount);
    $("energyValue").textContent = String(state.energy);
    $("energyFill").style.width = `${state.energy}%`;
    const thresholds = [35, 65, 90];
    thresholds.forEach((threshold, index) => {
      if (state.energy >= threshold) $("scene").classList.add(`energy-${threshold}`);
      if (before < threshold && state.energy >= threshold) {
        showEvent(["¡Lámparas activadas!", "¡Nuevo efecto visual desbloqueado!", "¡El chat cargó un pulso final!"][index]);
        if (index === 0) requestCaster("progress");
        else if (state.effects) showToast(["Efecto desbloqueado: luces de la sala", "Efecto desbloqueado: visión submarina", "Efecto desbloqueado: pulso final"][index]);
      }
    });
    const next = thresholds.find((threshold) => state.energy < threshold);
    $("nextUnlock").textContent = next ? `Siguiente efecto · ${next}%` : "¡Todos los efectos activos!";
  }

  function getCode() {
    return ["reloj", "estatua", "antorcha"].map((id) => state.room.clues[id].digit).join("");
  }

  function normalizeAnswer(value) {
    return String(value || "").toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, "");
  }

  function resolveObjectId(rawName) {
    const name = normalizeAnswer(String(rawName || "").replace(/[.!?]+$/, ""));
    return ["reloj", "estatua", "antorcha"].find((id) => {
      const clue = state.room.clues[id];
      return normalizeAnswer(id) === name || normalizeAnswer(clue.name) === name;
    });
  }

  function renderObjectLabels() {
    Object.entries(objectMeta).forEach(([id, meta]) => {
      const clue = state.room.clues[id];
      const label = clue.name || meta.label;
      $(meta.card).querySelector(".clue-name").textContent = label;
      $(meta.slot).querySelector("span").textContent = label.slice(0, 9);
      $(meta.display).textContent = "SIN EXAMINAR";
    });
    const firstObject = state.room.clues.reloj.name || "reloj";
    const firstCommand = document.querySelector('.inline-command[data-command]');
    if (firstCommand) {
      firstCommand.dataset.command = `!examinar ${firstObject.toLocaleLowerCase("es")}`;
      firstCommand.textContent = `!examinar ${firstObject.toLocaleLowerCase("es")}`;
    }
  }

  function clueSolved(id, user) {
    const meta = objectMeta[id];
    const clue = state.room.clues[id];
    state.clues[id] = true;
    syncThreeScene("clue", { id });
    $(meta.display).textContent = `${clue.name || meta.label} · ${clue.digit}`;
    $(meta.card).classList.add("found");
    $(meta.slot).classList.add("active");
    $(meta.slot).querySelector("i").textContent = clue.digit;
    const count = Object.keys(state.clues).length;
    $("clueCount").textContent = String(count);
    $("lockDisplay").textContent = ["reloj", "estatua", "antorcha"].map((key) => state.clues[key] ? state.room.clues[key].digit : "•").join(" ");
    addMessage({ user: "Sistema", text: `${user} resolvió ${clue.name || meta.label}: cifra ${clue.digit}.`, system: true, good: true });
    showEvent(`Acertijo resuelto · ${clue.name || meta.label}`);
    rewardUser(user, 16, 0);
    requestCaster("clue");
    if (count === 3) {
      const code = getCode();
      $("slotCode").classList.add("active");
      $("slotCode").querySelector("i").textContent = code.split("").join(" ");
      $("sceneHint").textContent = `¡Código completo! Escríbanlo para abrir la bóveda: !codigo ${code}`;
      $("chatBannerText").innerHTML = `¡Los 3 acertijos están resueltos! Prueben <b>!codigo ${escapeHTML(code)}</b> para abrir la bóveda.`;
      showToast(`Acertijos resueltos · código ${code}`);
    }
  }

  function revealClue(objectName, user, source = "demo") {
    const id = resolveObjectId(objectName);
    const meta = objectMeta[id];
    const clue = state.room.clues[id];
    if (!meta || !clue) {
      showCaption("No encuentras ese objeto. Prueba !ayuda para ver los tres nombres de esta sala.");
      showToast("Objeto no encontrado · consulta !ayuda");
      return;
    }
    if (state.clues[id]) {
      addMessage({ user: "Sistema", text: `${user} volvió a mirar ${clue.name}. El acertijo ya está resuelto.`, system: true });
      showCaption(`Cifra descubierta: ${clue.digit}.`);
      return;
    }
    state.examined[id] = true;
    $(meta.display).textContent = "ACERTIJO ACTIVO";
    $(meta.card).classList.add("examined");
    addMessage({ user: "Sistema", text: `${user} encontró un acertijo en ${clue.name}. Resuélvanlo y escriban !resolver ${id} [respuesta].`, system: true, highlight: true });
    showCaption(clue.riddle || clue.caption);
    showEvent(`Acertijo encontrado · ${clue.name}`);
  }

  function solveClue(args, user) {
    const [objectName = "", ...answerParts] = String(args || "").trim().split(/\s+/);
    const id = resolveObjectId(objectName);
    const clue = state.room.clues[id];
    if (!clue) return showCaption("Indica el objeto: !resolver reloj [respuesta]. Los nombres de esta sala aparecen en el panel.");
    if (!state.examined[id]) return showCaption(`Primero examinen ${clue.name}: !examinar ${id}.`);
    if (state.clues[id]) return showCaption(`${clue.name} ya está resuelto; la cifra es ${clue.digit}.`);
    const answer = answerParts.join(" ");
    if (!answer) return showCaption(`Escribe tu solución: !resolver ${id} [respuesta].`);
    if (normalizeAnswer(answer) !== normalizeAnswer(clue.answer)) {
      addMessage({ user: "Sistema", text: `${user} probó una respuesta para ${clue.name}, pero el mecanismo no reaccionó.`, system: true });
      showCaption("Esa respuesta no encaja. Revisen los datos o pidan !pista.");
      requestCaster("wrong");
      rewardUser(user, 2, 7000);
      return;
    }
    clueSolved(id, user);
  }

  function openVault(user, source = "demo") {
    if (state.opened) {
      addMessage({ user: "Sistema", text: "La bóveda ya está abierta. El chat se ganó su momento de gloria.", system: true });
      return;
    }
    state.opened = true;
    syncThreeScene("open");
    $("scene").classList.add("open");
    $("lockDisplay").textContent = getCode().split("").join(" ");
    $("successOverlay").classList.add("visible");
    $("sceneHint").textContent = "La bóveda se abrió. ¡El equipo completó la misión!";
    $("chatBannerText").innerHTML = "¡El equipo escapó! Pulsa ↻ para comenzar una nueva ronda.";
    addMessage({ user: "Sistema", text: `${user} encontró el código. ¡La bóveda se abre!`, system: true, good: true });
    showEvent("¡BÓVEDA ABIERTA! · MISIÓN COMPLETADA");
    requestCaster("open");
    $("slotCode").classList.add("active");
    $("slotCode").querySelector("i").textContent = "✓";
  }

  function switchPreset(name, user) {
    const aliases = { neon: "neon", neón: "neon", ambar: "ambar", ámbar: "ambar", bruma: "bruma" };
    const preset = aliases[name.toLocaleLowerCase("es")];
    if (!preset) {
      showCaption("Estilos disponibles: neon, ambar o bruma.");
      return;
    }
    const scene = $("scene");
    scene.classList.remove("preset-neon", "preset-ambar", "preset-bruma");
    scene.classList.add(`preset-${preset}`);
    state.currentPreset = preset;
    syncThreeScene("preset", { preset });
    const names = { neon: "neón", ambar: "ámbar", bruma: "bruma submarina" };
    showEvent(`${user} cambió el ambiente · ${names[preset]}`);
    showToast(`El chat cambió el ambiente a ${names[preset]}`);
    rewardUser(user, 7, 6000);
  }

  function applyRewardHint(user) {
    if (state.opened) return showCaption("La bóveda ya se abrió; guarda tus puntos para la próxima sala.");
    const missingId = ["reloj", "estatua", "antorcha"].find((id) => !state.clues[id]);
    if (!missingId) return showCaption(`El equipo ya encontró todas las pistas. Código: ${getCode()}.`);
    const clue = state.room.clues[missingId];
    showCaption(clue.hint);
    addMessage({ user: "Sistema", text: `${user} canjeó una recompensa: Mimo dio una pista sobre ${missingId}.`, system: true, highlight: true });
    showEvent(`${user} canjeó una pista de canal`);
    requestCaster("hint");
  }

  function handleChannelReward(redemption, source = "twitch") {
    const user = String(redemption.user || "chat").slice(0, 32);
    const title = String(redemption.title || "Recompensa").slice(0, 45);
    const inputText = String(redemption.userInput || "").replace(/[<>\u0000-\u001f]/g, " ").trim().slice(0, 64);
    const points = Number(redemption.points) || 0;
    addMessage({ user, color: "gold", text: `canjeó ${title}${points ? ` · ${points} puntos` : ""}`, source, highlight: true });
    const match = title.match(/^nexo\s*[·:|\-]\s*(pista|estilo|tema|mimo)$/i);
    const action = match?.[1]?.toLocaleLowerCase("es");
    if (!action) {
      showEvent(`${user} canjeó ${title}`);
      return;
    }
    if (action === "pista") {
      applyRewardHint(user);
    } else if (action === "estilo") {
      const allowed = new Set(["neon", "neón", "ambar", "ámbar", "bruma"]);
      if (allowed.has(inputText.toLocaleLowerCase("es"))) switchPreset(inputText, user);
      else showCaption("Para Nexo · Estilo, configura el mensaje del canje para pedir neon, ambar o bruma.");
    } else if (action === "tema") {
      if (!inputText) return showCaption("Configura Nexo · Tema para pedir una idea en el mensaje de canje.");
      $("themeInput").value = inputText;
      addMessage({ user: "Sistema", text: `${user} propuso «${inputText}» con puntos del canal. El streamer revisa la idea antes de crearla.`, system: true, good: true });
      showEvent(`${user} propuso una sala con puntos`);
    } else {
      showEvent(`${user} pidió una reacción de Mimo con puntos`);
      requestCaster("chat");
    }
  }

  function processCommand(text, user, source = "demo") {
    const cleaned = String(text).trim().slice(0, 180);
    if (!cleaned) return;
    const match = cleaned.match(/^!(\S+)(?:\s+(.+))?$/i);
    const color = users.find((entry) => entry.name.toLowerCase() === String(user).toLowerCase())?.color || (source === "twitch" ? "blue" : "gold");
    addMessage({ user, color, text: cleaned, command: Boolean(match), source });
    if (!match) {
      rewardUser(user, 2, 7000);
      if (/\b(f|jaj|xd|lol|gg)\b/i.test(cleaned) && state.effects) requestCaster("chat");
      return;
    }
    const command = match[1].toLocaleLowerCase("es");
    const args = (match[2] || "").trim();
    if (command === "canje" && source === "demo") {
      const [kind = "", ...rest] = args.split(/\s+/);
      const aliases = { pista: "Pista", estilo: "Estilo", tema: "Tema", mimo: "Mimo" };
      const title = aliases[kind.toLocaleLowerCase("es")];
      if (!title) {
        addMessage({ user: "Sistema", text: "Simula un canje: !canje pista · !canje estilo neon · !canje tema bosque · !canje mimo.", system: true });
      } else {
        handleChannelReward({ user, title: `Nexo · ${title}`, userInput: rest.join(" "), points: 0 }, "demo");
      }
      return;
    }
    if (command === "examinar" || command === "mirar") {
      if (!args) addMessage({ user: "Sistema", text: `Indica un objeto: ${["reloj", "estatua", "antorcha"].map((id) => state.room.clues[id].name).join(", ")}.`, system: true });
      else revealClue(args, user, source);
      return;
    }
    if (command === "resolver") {
      solveClue(args, user);
      return;
    }
    if (command === "codigo" || command === "código") {
      if (args.replace(/\s/g, "") === getCode()) openVault(user, source);
      else {
        addMessage({ user: "Sistema", text: "Ese código no funcionó. Examinen y resuelvan los acertijos de la sala.", system: true });
        showCaption("La cerradura no reconoce esa combinación.");
        requestCaster("wrong");
        rewardUser(user, 3, 7000);
      }
      return;
    }
    if (command === "pista") {
      if (state.energy < 35) {
        addMessage({ user: "Sistema", text: `La comunidad necesita ${35 - state.energy} puntos de energía para desbloquear una pista.`, system: true });
        return;
      }
      const missingId = ["reloj", "estatua", "antorcha"].find((id) => !state.clues[id]);
      if (missingId) {
        state.energy = Math.max(0, state.energy - 12);
        $("energyValue").textContent = String(state.energy);
        $("energyFill").style.width = `${state.energy}%`;
        showCaption(`${state.room.clues[missingId].name}: ${state.room.clues[missingId].hint}`);
        addMessage({ user: "Sistema", text: `El equipo desbloqueó una pista para ${missingId}.`, system: true, highlight: true });
        requestCaster("hint");
      } else showCaption(`Ya tienen todas las pistas. ¡Prueben !codigo ${getCode()}!`);
      return;
    }
    if (command === "estilo") {
      switchPreset(args || "", user);
      return;
    }
    if (command === "tema") {
      const theme = args.replace(/[<>\u0000-\u001f]/g, " ").trim().slice(0, 64);
      if (!theme) {
        addMessage({ user: "Sistema", text: "Sugiere un tema: !tema una estación espacial abandonada. El streamer decide si crea esa sala.", system: true });
        return;
      }
      $("themeInput").value = theme;
      addMessage({ user: "Sistema", text: `${user} propuso el tema «${theme}». El streamer puede revisarlo y crear la sala.`, system: true, good: true });
      showEvent(`${user} propuso una nueva sala`);
      return;
    }
    if (command === "reacciona") {
      requestCaster("chat");
      showEvent(`${user} pidió una reacción de Mimo`);
      return;
    }
    if (command === "ayuda" || command === "help") {
      addMessage({ user: "Sistema", text: "Comandos: !examinar [objeto] · !resolver [objeto] [respuesta] · !pista · !codigo [código] · !tema [idea] · !votar neon/ambar/bruma · !reacciona", system: true });
      return;
    }
    if (command === "votar") {
      const aliases = { neon: "neon", neón: "neon", ambar: "ambar", ámbar: "ambar", bruma: "bruma" };
      const choice = aliases[args.toLocaleLowerCase("es")];
      if (!choice) {
        addMessage({ user: "Sistema", text: "Vota por un efecto visual: !votar neon, !votar ambar o !votar bruma.", system: true });
        return;
      }
      state.styleVotes.set(String(user).toLocaleLowerCase("es"), choice);
      rewardUser(user, 3, 6000);
      const tally = [...state.styleVotes.values()].reduce((counts, vote) => ({ ...counts, [vote]: (counts[vote] || 0) + 1 }), {});
      const labels = { neon: "neón", ambar: "ámbar", bruma: "bruma" };
      const leader = Object.entries(tally).sort((a, b) => b[1] - a[1])[0];
      showEvent(`Voto registrado · ${labels[choice]} · ${state.styleVotes.size} participantes`);
      if (state.styleVotes.size >= 3 && leader && leader[1] > (Object.values(tally).sort((a, b) => b - a)[1] || 0)) {
        switchPreset(leader[0], "La comunidad");
        state.styleVotes.clear();
        addMessage({ user: "Sistema", text: `La votación eligió el estilo ${labels[leader[0]]}. ¡El chat cambió la escena!`, system: true, good: true });
      }
      return;
    }
    addMessage({ user: "Sistema", text: `Comando !${escapeHTML(command)} desconocido. Prueba !ayuda.`, system: true });
  }

  function applyRoom(room, note = null) {
    if (!room || !room.clues) return;
    const roomKey = `${room.title}|${room.code}|${room.opening}|${JSON.stringify(room.clues)}`;
    if (roomKey === state.lastRoomKey) {
      const generatedWithAI = room.source === "openai";
      const sourceBadge = $("roomSourceBadge");
      sourceBadge.textContent = generatedWithAI ? "GENERADA CON OPENAI" : "PLANTILLA DE RESPALDO";
      sourceBadge.classList.toggle("source-ai", generatedWithAI);
      sourceBadge.classList.toggle("source-template", !generatedWithAI);
      const noteElement = $("roomGenerationNote");
      noteElement.hidden = false;
      noteElement.classList.toggle("warning", Boolean(note) || !generatedWithAI);
      noteElement.textContent = note || (generatedWithAI
        ? "OpenAI creó el argumento y los tres acertijos específicos de esta situación. La combinación se muestra al resolverlos."
        : "Esta sala usa acertijos de plantilla. El tema aparece en la historia, pero los acertijos no se personalizaron con OpenAI.");
      return;
    }
    state.lastRoomKey = roomKey;
    state.room = room;
    const environments = ["underwater", "space", "haunted", "jungle"];
    const environmentNames = { underwater: "Bajo el agua", space: "Espacio profundo", haunted: "Mansión encantada", jungle: "Jungla antigua" };
    const scene = $("scene");
    scene.classList.remove(...environments.map((environment) => `environment-${environment}`));
    scene.classList.add(`environment-${environments.includes(room.environment) ? room.environment : "underwater"}`);
    syncThreeScene("environment", { environment: environments.includes(room.environment) ? room.environment : "underwater" });
    $("streamHeadingTitle").textContent = room.title;
    $("roomLabelText").textContent = room.title.toLocaleUpperCase("es").slice(0, 30);
    $("sceneCaption").lastElementChild.textContent = room.opening;
    $("roomBriefTitle").textContent = room.title;
    $("roomBriefStory").textContent = room.summary || room.opening || `El chat debe resolver tres acertijos inspirados en «${room.theme || "la situación propuesta"}» y abrir la bóveda.`;
    $("roomThemeFact").textContent = `Situación · ${room.theme || "Reto de la comunidad"}`;
    $("roomEnvironmentFact").textContent = `Atmósfera · ${environmentNames[room.environment] || environmentNames.underwater}`;
    const sourceBadge = $("roomSourceBadge");
    const generatedWithAI = room.source === "openai";
    sourceBadge.textContent = generatedWithAI ? "GENERADA CON OPENAI" : "PLANTILLA DE RESPALDO";
    sourceBadge.classList.toggle("source-ai", generatedWithAI);
    sourceBadge.classList.toggle("source-template", !generatedWithAI);
    const objectList = $("roomObjectList");
    objectList.replaceChildren();
    Object.entries(objectMeta).forEach(([id]) => {
      const clue = room.clues[id];
      const item = document.createElement("div");
      item.className = "room-object";
      const name = document.createElement("strong");
      name.textContent = clue.name || id.toLocaleUpperCase("es");
      const riddle = document.createElement("span");
      riddle.textContent = clue.riddle || clue.caption || "Acertijo por descubrir.";
      item.append(name, riddle);
      objectList.append(item);
    });
    const firstObject = room.clues.reloj?.name || "reloj";
    $("roomFirstStep").replaceChildren(document.createTextNode("Empiecen con "));
    const firstCommand = document.createElement("code");
    firstCommand.textContent = `!examinar ${firstObject.toLocaleLowerCase("es")}`;
    $("roomFirstStep").append(firstCommand, document.createTextNode(" en el chat."));
    const generationNote = $("roomGenerationNote");
    generationNote.hidden = false;
    generationNote.classList.toggle("warning", Boolean(note) || !generatedWithAI);
    generationNote.textContent = note || (generatedWithAI
      ? "OpenAI creó el argumento y los tres acertijos específicos de esta situación. La combinación se muestra al resolverlos."
      : "Esta sala usa acertijos de plantilla. El tema aparece en la historia, pero los acertijos no se personalizaron con OpenAI.");
    renderObjectLabels();
    $("sceneHint").textContent = "Examinen cada objeto, resuelvan sus acertijos y prueben el código final.";
    $("chatBannerText").innerHTML = `Encuentren los objetos, resuelvan sus acertijos y escriban <b>!codigo [código]</b>.`;
    if (note) showToast(note);
    resetGame(false);
    showCaption(room.opening);
    const generatedMessage = room.source === "openai"
      ? `Sala «${room.title}» generada con OpenAI. ${room.summary || room.opening} Empiecen con !examinar ${firstObject.toLocaleLowerCase("es")} en el chat.`
      : `Sala «${room.title}» creada con plantilla. ${note || "Los acertijos son de respaldo y no están adaptados por OpenAI."} Empiecen con !examinar ${firstObject.toLocaleLowerCase("es")}.`;
    addMessage({ user: "NEXO · MISIÓN", text: generatedMessage, system: true, good: room.source === "openai" });
    showEvent(room.source === "openai" ? "Sala generada con OpenAI · mira el dossier" : "Sala de respaldo · mira el motivo en el dossier");
  }

  function resetGame(showMessage = true) {
    state.clues = {};
    state.examined = {};
    state.energy = 12;
    state.opened = false;
    state.styleVotes.clear();
    $("scene").classList.remove("open", "energy-35", "energy-65", "energy-90");
    syncThreeScene("reset");
    $("successOverlay").classList.remove("visible");
    $("sceneHint").textContent = "Pista colectiva: examina los objetos para reunir el código.";
    $("clueCount").textContent = "0";
    $("energyValue").textContent = "12";
    $("energyFill").style.width = "12%";
    $("nextUnlock").textContent = "Siguiente efecto · 35%";
    $("lockDisplay").textContent = "● ● ●";
    Object.entries(objectMeta).forEach(([id, meta]) => {
      $(meta.display).textContent = "SIN EXAMINAR";
      $(meta.card).classList.remove("found");
      $(meta.card).classList.remove("examined");
      $(meta.slot).classList.remove("active");
      $(meta.slot).querySelector("i").textContent = "?";
      $(meta.slot).querySelector("span").textContent = state.room.clues[id]?.name?.slice(0, 9) || meta.label;
    });
    $("slotCode").classList.remove("active");
    $("slotCode").querySelector("i").textContent = "•••";
    $("chatBannerText").innerHTML = "Examinen los objetos, resuelvan sus acertijos y escriban <b>!codigo [código]</b>.";
    if (showMessage) {
      addMessage({ user: "Sistema", text: "Nueva ronda iniciada. Chat, la sala está lista.", system: true });
      setCaster("Nueva sala, misma oportunidad para que el chat salve al streamer.", false);
      showToast("Ronda reiniciada · vuelvan a investigar");
    }
  }

  async function createRoom(theme) {
    const prompt = String(theme || "").trim();
    if (!prompt) return showToast("Escribe un tema para la sala.");
    const button = $("generateButton");
    button.disabled = true;
    button.textContent = "GENERANDO…";
    $("aiStatus").classList.add("busy");
    $("roomGenerationNote").hidden = false;
    $("roomGenerationNote").classList.remove("warning");
    $("roomGenerationNote").textContent = "Conectando con Nexo y pidiendo a OpenAI una historia y tres acertijos basados en esta situación… Si Render estaba dormido, la primera respuesta puede tardar.";
    $("roomSourceBadge").textContent = "GENERANDO SALA…";
    $("roomSourceBadge").classList.remove("source-ai", "source-template");
    try {
      const result = await api("/api/rooms/generate", { method: "POST", body: JSON.stringify({ theme: prompt }) });
      state.serverAvailable = true;
      applyRoom(result.room, result.note);
      if (result.room?.source === "openai") requestCaster("room");
      $("themeInput").value = "";
    } catch (error) {
      const room = structuredClone(fallbackRoom);
      room.theme = prompt.slice(0, 64);
      room.title = `${prompt.charAt(0).toLocaleUpperCase("es")}${prompt.slice(1, 43)}: la Cámara Sellada`;
      room.summary = `El chat investiga «${room.theme}» resolviendo tres acertijos de respaldo para abrir la bóveda.`;
      room.opening = `Situación: ${room.theme}. Resuelvan los tres acertijos y usen el código para abrir la bóveda.`;
      const lowerTheme = prompt.toLocaleLowerCase("es");
      room.environment = /espaci|planeta|nave|luna|galax|astronaut|órbita|orbita/.test(lowerTheme) ? "space" : /bosque|jungla|selva|templo|isla|jardín|jardin/.test(lowerTheme) ? "jungle" : /fantasma|embruj|castillo|cripta|vampir|terror/.test(lowerTheme) ? "haunted" : "underwater";
      room.source = "plantilla";
      state.serverAvailable = false;
      const explanation = `No se pudo contactar al servidor (${error.message || "sin respuesta"}). Se cargó una plantilla local; OpenAI no generó esta sala. Revisa que Render esté en línea y vuelve a intentarlo.`;
      applyRoom(room, explanation);
      showToast("Se usó plantilla local · consulta el dossier de la misión");
    } finally {
      button.disabled = false;
      button.innerHTML = "CREAR SALA <span>↗</span>";
      $("aiStatus").classList.remove("busy");
    }
  }

  function setTwitchStatus(payload) {
    if (!payload?.twitch) return;
    state.twitchConfigured = payload.twitch.configured;
    state.twitchStatus = payload.twitch.status;
    state.aiEnabled = Boolean(payload.ai?.enabled);
    const chip = $("connectionState");
    chip.classList.remove("connected", "connecting", "waiting", "error");
    const status = state.twitchStatus;
    const connected = status === "connected";
    if (connected) {
      chip.classList.add("connected");
      $("connectionLabel").textContent = `TWITCH · ${payload.twitch.login || "CONECTADO"}`;
      $("connectButton").textContent = "DESCONECTAR";
      $("streamState").textContent = payload.twitch.rewardsAvailable ? "CHAT + PUNTOS" : "CHAT DE TWITCH";
      $("chatModeLabel").textContent = payload.twitch.rewardsAvailable ? "TWITCH · CHAT + PUNTOS" : "TWITCH EN VIVO";
      $("chatInput").placeholder = "Simula un comando local...";
      $("chatBannerText").setAttribute("aria-live", "polite");
      if (payload.twitch.rewardsError) showToast("Chat conectado; Twitch no habilitó los canjes de puntos.");
    } else {
      if (["connecting", "reconnecting"].includes(status)) chip.classList.add("connecting");
      else if (status === "waiting_for_authorization") chip.classList.add("waiting");
      else if (status === "error") chip.classList.add("error");
      $("connectionLabel").textContent = status === "waiting_for_authorization" ? "AUTORIZA TWITCH" : status === "connecting" ? "CONECTANDO…" : status === "reconnecting" ? "RECONECTANDO…" : "MODO DEMO";
      $("connectButton").innerHTML = "CONECTAR TWITCH <span>↗</span>";
      $("streamState").textContent = "MODO DEMO";
      $("chatModeLabel").textContent = "SIMULACIÓN";
      $("chatInput").placeholder = "Escribe un comando...";
    }
    const ai = $("aiStatus");
    ai.classList.toggle("ready", state.aiEnabled);
    ai.innerHTML = `<span class="ai-indicator"></span>${state.aiEnabled ? `OPENAI CONFIGURADO · ${escapeHTML(payload.ai.model)}` : "PLANTILLAS · OPENAI NO CONFIGURADO"}`;
  }

  function connectEvents() {
    if (typeof EventSource !== "function") return;
    try {
      state.eventSource = new EventSource(apiPath("/api/events"));
      state.eventSource.addEventListener("status", (event) => {
        try { setTwitchStatus(JSON.parse(event.data)); } catch {}
      });
      state.eventSource.addEventListener("chat-message", (event) => {
        try {
          const message = JSON.parse(event.data);
          processCommand(message.text, message.user || message.login || "chat", "twitch");
        } catch {}
      });
      state.eventSource.addEventListener("channel-reward", (event) => {
        try { handleChannelReward(JSON.parse(event.data)); } catch {}
      });
      state.eventSource.addEventListener("room-generated", (event) => {
        try { const result = JSON.parse(event.data); applyRoom(result.room, result.note); } catch {}
      });
      state.eventSource.addEventListener("caster-line", (event) => {
        try { const result = JSON.parse(event.data); setCaster(result.line, false, result.source || "openai"); } catch {}
      });
      state.eventSource.onopen = () => { state.serverAvailable = true; };
      state.eventSource.onerror = () => { state.serverAvailable = false; };
    } catch {
      state.serverAvailable = false;
      const ai = $("aiStatus");
      ai.classList.remove("ready");
      ai.innerHTML = `<span class="ai-indicator"></span>SERVIDOR SIN RESPUESTA · SE INTENTARÁ AL CREAR`;
    }
  }

  async function checkServer() {
    try {
      const status = await api("/api/status");
      state.serverAvailable = true;
      setTwitchStatus(status);
    } catch { state.serverAvailable = false; }
  }

  function openTwitchModal() {
    $("twitchModal").hidden = false;
    $("deviceCodeBox").hidden = true;
    $("twitchDialogStatus").classList.remove("error");
    if (!state.twitchConfigured) {
      $("twitchDialogTitle").textContent = "Falta configurar Twitch";
      $("twitchDialogCopy").textContent = "Copia TWITCH_CLIENT_ID de tu aplicación registrada en Twitch a .env y reinicia el servidor local.";
      $("twitchDialogStatus").textContent = "El modo demo sigue disponible mientras conectas la aplicación.";
      return;
    }
    $("twitchDialogTitle").textContent = "Autoriza tu canal";
    $("twitchDialogCopy").textContent = "Nexo solicitará permiso para leer el chat y los canjes de puntos de Twitch. Mimo aparece como Co-Caster visual en el overlay.";
    $("twitchDialogStatus").textContent = "Solicitando código seguro de activación…";
    api("/api/twitch/device", { method: "POST", body: "{}" }).then((device) => {
      $("deviceCodeBox").hidden = false;
      $("deviceCode").textContent = device.userCode;
      $("activateLink").href = device.verificationUri || "https://www.twitch.tv/activate";
      $("twitchDialogStatus").textContent = "Después de autorizar, Nexo conectará el chat y los canjes de puntos si tu canal los tiene habilitados.";
      window.clearInterval(state.devicePoll);
      state.devicePoll = window.setInterval(pollDeviceStatus, Math.max(4000, (device.interval || 5) * 1000));
      pollDeviceStatus();
    }).catch((error) => {
      $("twitchDialogStatus").classList.add("error");
      $("twitchDialogStatus").textContent = error.message;
    });
  }

  async function pollDeviceStatus() {
    try {
      const result = await api("/api/twitch/device/status");
      setTwitchStatus(result);
      if (result.status === "authorized" || result.twitch?.status === "connecting") $("twitchDialogStatus").textContent = "Autorización recibida. Conectando con el chat…";
      if (result.twitch?.status === "connected") {
        window.clearInterval(state.devicePoll);
        $("twitchDialogTitle").textContent = "¡Chat conectado!";
        $("twitchDialogStatus").textContent = result.twitch.rewardsAvailable ? `Chat y canjes de ${result.twitch.displayName || result.twitch.login} conectados.` : `Chat de ${result.twitch.displayName || result.twitch.login} conectado. Los canjes de puntos no están disponibles.`;
        $("deviceCodeBox").hidden = true;
        $("twitchDialogAction").textContent = "LISTO";
      }
      if (["expired", "failed"].includes(result.status) || result.twitch?.status === "error") {
        window.clearInterval(state.devicePoll);
        $("twitchDialogStatus").classList.add("error");
        $("twitchDialogStatus").textContent = result.error || result.detail || "No se pudo completar la conexión.";
      }
    } catch (error) {
      $("twitchDialogStatus").classList.add("error");
      $("twitchDialogStatus").textContent = error.message;
    }
  }

  async function disconnectTwitch() {
    try { await api("/api/twitch/disconnect", { method: "POST", body: "{}" }); showToast("Chat de Twitch desconectado"); }
    catch (error) { showToast(error.message); }
  }

  function seedChat() {
    initialMessages.forEach((message, index) => {
      window.setTimeout(() => addMessage({ ...message }), index * 170);
    });
    window.setTimeout(() => setCaster("A ver, equipo. Tres pistas, una puerta y cero presión… bueno, casi.", true, "demo"), initialMessages.length * 170 + 150);
  }

  $("chatForm").addEventListener("submit", (event) => {
    event.preventDefault();
    if (input.value.trim()) processCommand(input.value, "tú", "demo");
    input.value = "";
    input.focus();
  });
  $("roomForm").addEventListener("submit", (event) => {
    event.preventDefault();
    createRoom($("themeInput").value);
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
  $("connectButton").addEventListener("click", () => state.twitchStatus === "connected" ? disconnectTwitch() : openTwitchModal());
  $("closeTwitchModal").addEventListener("click", () => { $("twitchModal").hidden = true; });
  $("twitchDialogAction").addEventListener("click", () => { $("twitchModal").hidden = true; });
  $("twitchModal").addEventListener("click", (event) => { if (event.target === $("twitchModal")) $("twitchModal").hidden = true; });
  $("resetButton").addEventListener("click", () => resetGame(true));
  $("nextRoomButton").addEventListener("click", () => resetGame(true));
  $("fullscreenButton").addEventListener("click", async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else await $("gameFrame").requestFullscreen();
    } catch { showToast("Pantalla completa no disponible en este navegador"); }
  });

  const roomHeading = document.querySelector(".stream-heading h1");
  roomHeading.id = "streamHeadingTitle";
  roomHeading.textContent = state.room.title;
  $("roomLabelText").textContent = state.room.title.toLocaleUpperCase("es");
  $("scene").classList.add("preset-bruma");
  document.body.classList.toggle("overlay-mode", overlayMode);
  connectEvents();
  checkServer();
  seedChat();
})();
