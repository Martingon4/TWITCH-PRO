# Nexo demo video script

Target length: about 2 minutes 35 seconds. The official maximum is under 3 minutes. The video must be publicly visible on YouTube and include both the real Twitch experience and how the project was built with Codex.

Record the narration in English or add accurate English subtitles to the Spanish narration. Replace bracketed placeholders with the real room's displayed object names and code. Use a test channel, a separate viewer account, and your own OBS scene. Keep all passwords, activation codes, private overlay URLs, email addresses, and API keys off-screen. Do not include copyrighted music.

## Shot list and narration

### 0:00–0:15 — Introduce the problem

**Show:** Twitch stream with a busy chat; title card “Nexo: A Cooperative Escape Room for Twitch Chat”.

**Narration:** “Fast-moving Twitch chats are hard to follow. Nexo gives viewers a shared mission: work together to solve an escape room while the streamer plays.”

### 0:15–0:45 — Prove the Twitch connection

**Show:** Streamer dashboard indicating the test channel is connected. From the second viewer account, send a real command such as !examinar [object name]. Show that message in the Twitch chat and the corresponding clue update in Nexo.

**Narration:** “The streamer connects a Twitch channel, chooses a room, and adds Nexo to OBS as a browser overlay. Viewers join through ordinary chat commands.”

### 0:45–1:15 — Show the game and overlay

**Show:** OBS with the actual Nexo browser overlay. Solve one clue using the answer from the riddle; reveal a digit and show the progress toward the vault.

**Narration:** “Each room has three clues. The chat investigates objects, shares answers, and reveals digits. When the team has the code, one final command opens the vault.”

### 1:15–1:45 — Show choices and visual feedback

**Show:** Streamer selects a second template, starts a room, then send a safe command such as !estilo neon and !reacciona from Twitch chat. Show Three.js scene effects and Mimo.

**Narration:** “Streamers can choose from themed templates or optionally generate a new room with AI. Chat can change approved visual styles, request a hint, and trigger Mimo's friendly Co-Caster reactions.”

### 1:45–2:10 — Explain the streamer impact

**Show:** Room summary, chat activity, clue progress, and Mimo reaction together on the overlay.

**Narration:** “Nexo gives the streamer a repeatable interactive segment and gives viewers a reason to coordinate, make suggestions, and stay involved in the live moment.”

### 2:10–2:35 — Show how Codex helped build it

**Show:** Codex project conversation and safe code diffs for Twitch EventSub, the escape-room flow, Three.js, and channel-separated storage. Do not show terminal secrets or environment values.

**Narration:** “We built Nexo with OpenAI Codex. Codex helped us plan the streamer and viewer flows, implement the Twitch integration and game logic, develop the overlay, and refine the experience from real test feedback.”

## Before uploading

- Keep the final video under 3:00.
- Show real Twitch chat, not only the public browser simulation.
- Show the project being built with Codex.
- Check English narration/subtitles and audio clarity.
- Hide credentials and private identifiers.
- Upload to YouTube and set visibility to **Public**.
- Open the YouTube link in a signed-out browser and check playback.
