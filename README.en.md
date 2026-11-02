# Nexo — Twitch Chat Escape Room

Nexo turns a Twitch stream into a cooperative escape room. The streamer sets up a scenario; viewers investigate clues, solve puzzles, unlock a vault, trigger visual styles, and ask Mimo—the visual Co-Caster—to react. The project was built with OpenAI Codex and connects to Twitch chat and EventSub, with a Three.js overlay for OBS.

- **Streamer dashboard:** https://twitch-pro.onrender.com/ (sign in with Twitch and authorize your channel)
- **Viewer demo:** https://twitch-pro.onrender.com/demo (free public simulation; live viewers participate through Twitch chat)
- **Deployed source branch:** https://github.com/Martingon4/TWITCH-PRO/tree/codex/online-render
- **Submission materials:** [Devpost draft and video outline](DEVPOST-SUBMISSION.md)
- **Video script:** [VIDEO-SCRIPT.md](VIDEO-SCRIPT.md)
- **Streamer test guide:** [USER-TEST-GUIDE.en.md](USER-TEST-GUIDE.en.md)

The public demo runs a template-based simulation in the visitor's browser. It does not connect to Twitch, call an AI provider, store progress, or expose the protected streamer APIs. Use it to evaluate the game flow without credentials or API costs.

## Features

- Eight selectable escape-room scenarios plus a surprise template. Each has a story, three clues, progressive hints, and a verifiable code.
- Free template mode; optional Gemini or OpenAI generation for original scenarios.
- Mimo provides short, friendly Co-Caster reactions with local fallback lines.
- Twitch chat and channel-point redemption events through EventSub WebSocket.
- Viewers can investigate clues, solve puzzles, request hints and reactions, and activate safe visual styles.
- Three.js environments and a private OBS overlay link for the connected Twitch channel.
- Timed rounds: choose 3, 4, or 5 minutes (4 by default). The countdown starts when chat examines its first object with `!examinar [object]`, shows one-minute, 30-second, and 10-second warnings, and displays a failure state if time runs out.
- Per-channel room, progress, chat, and encrypted Twitch tokens stored in PostgreSQL.

The app never executes HTML, CSS, or JavaScript supplied by chat. Chat context sent to an AI provider may contain personal information; do not send private data. Nexo reads chat and channel-point redemptions. It does not create, modify, or fulfill Twitch rewards.

## Run locally

Requirements: Node.js 22 or later.

    git clone --branch codex/online-render --single-branch https://github.com/Martingon4/TWITCH-PRO.git
    cd TWITCH-PRO
    npm ci
    cp .env.example .env
    npm start

Open http://localhost:4173. Without credentials, the local app uses the demo mode and free templates.

For real Twitch testing, set TWITCH_CLIENT_ID in .env before starting the local app. Local development does not require the hosted dashboard password.

## Optional AI scenario generation

Add one provider key to the local .env file or to the Render service's private environment variables:

    GEMINI_API_KEY=your_google_ai_studio_key
    GEMINI_MODEL=gemini-3.5-flash-lite
    # Or:
    OPENAI_API_KEY=your_openai_api_key
    OPENAI_MODEL=gpt-4.1-mini

AI generation can consume the configured provider's quota or credits. Template mode does not call an AI API. Never commit .env or share API keys.

## Connect a Twitch channel

1. Create a Twitch Developer application and set TWITCH_CLIENT_ID.
2. Set the Twitch client ID in the local .env or the Render environment.
3. On Render, choose **ENTRAR COMO STREAMER CON TWITCH** on the welcome screen; viewers can choose **PROBAR COMO ESPECTADOR** to open the no-login simulation. Locally, configure the Twitch app and authorize through the dashboard.
4. The channel owner completes Twitch's device authorization flow and approves the requested read scopes.
5. Use a second Twitch account to send a command in the channel chat.
6. Copy the private overlay URL from the dashboard into an OBS Browser Source.

Each streamer signs in with and authorizes their own Twitch account. Twitch can identify Partner/Affiliate accounts and whether a channel is live at that moment; an offline or unaffiliated account can still be a streamer, so the sign-in screen lets the visitor choose the role. The dashboard session is bound to that Twitch User ID; channel data is separated by Twitch User ID. Viewers can try the public simulation without an account and join live games through Twitch chat.

## Render deployment

The Render Blueprint is in render.yaml. Production requires APP_SESSION_SECRET, DATABASE_URL, and TOKEN_ENCRYPTION_KEY; the Blueprint generates the session and encryption keys and links PostgreSQL. Add TWITCH_CLIENT_ID, plus optional GEMINI_API_KEY or OPENAI_API_KEY, in Render's private Environment settings.

Render's free web instance may sleep between visits. Check current Render database retention and service limits before using it beyond the hackathon.

## Testing

Start with the public demo at https://twitch-pro.onrender.com/demo. It has no login and stays on free templates. For live Twitch, Gemini, OBS, reward setup, and multi-streamer isolation, follow [USER-TEST-GUIDE.en.md](USER-TEST-GUIDE.en.md).

## Commands

Choose a 3-, 4-, or 5-minute limit before starting. The countdown begins when a room starts or is reset. If it reaches zero before the vault opens, the round fails and the streamer can restart it.

- !ayuda — list the current room's commands.
- !examinar [object] — reveal that object's riddle.
- !resolver [object] [answer] — solve the riddle and reveal its digit.
- !codigo [code] — open the vault when the code is correct.
- !pista — request a community hint when enough energy is available.
- !tema [idea] — suggest a scenario for the streamer to review.
- !estilo [style or visual request] — choose a safe visual style.
- !reacciona — request a Mimo reaction.

## Project structure

- server.mjs: Node server, Twitch events, API and scenario generation.
- multi-tenant-store.mjs: PostgreSQL persistence, Twitch token encryption, channel isolation and event leases.
- room-templates.mjs: free offline scenario templates.
- app.js: game flow, commands, Mimo, and overlay synchronization.
- index.html, styles.css, enhancements.css, ux-refresh.css, scene3d.js: dashboard and Three.js overlay.
