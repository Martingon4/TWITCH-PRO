# Devpost submission package — Nexo

Use this English draft in the Devpost form. Confirm the final demo links and eligibility details before submitting.

## Project title

Nexo: A Cooperative Escape Room for Twitch Chat

## One-line description

Turn a Twitch stream into a live, chat-driven escape room where viewers investigate clues, unlock a vault, reshape the scene, and react with Mimo.

## Project description

Nexo gives Twitch streamers a cooperative escape-room format built around their live community. A streamer chooses a scenario and places the game in an OBS browser overlay. Viewers use Twitch chat commands to inspect objects, solve three clues, collect a vault code, request hints, and trigger safe visual styles. Mimo, a visual Co-Caster, reacts to chat and game events.

The project connects to Twitch through device authorization, EventSub chat and channel-point redemption events, and a per-channel overlay. PostgreSQL keeps each channel's room, progress, recent chat, and encrypted Twitch tokens separate. Streamers can use free templates or optionally generate an original room with Gemini or OpenAI. The public demo stays on local templates and requires no login, Twitch authorization, or AI API key.

Submission language note: the app interface is currently in Spanish. Include the English guide and English video narration or subtitles so judges can follow every interaction.

## How we used OpenAI Codex

We used OpenAI Codex throughout the build to plan the streamer and viewer flows, implement the Node.js server and Twitch EventSub integration, develop the Three.js game and OBS overlay, add PostgreSQL-backed channel isolation, improve the interface, and troubleshoot Gemini structured-output compatibility. We reviewed and adjusted the generated code and tested the experience against the deployed service.

Edit this paragraph to match the team's actual use of Codex and the work shown in the video.

## Links

- Code repository (select the deployed branch): https://github.com/Martingon4/TWITCH-PRO/tree/codex/online-render
- Public demo (no login): https://twitch-pro.onrender.com/demo
- Streamer dashboard (protected): https://twitch-pro.onrender.com/

The public demo is a no-login, template-only browser simulation. It cannot connect Twitch or spend AI API quota. Live Twitch and OBS integration should be shown in the demo video.

## Codex session ID

01a18e06-1e5c-7330-bd62-3c58f1ea522c

## Judge test instructions

1. Open the public demo link; it does not require an account.
2. Choose a scenario card and select **Create room**.
3. Follow the object names and commands shown in the room. Use the simulated chat field to inspect and solve clues, request a hint, trigger a visual style, and ask Mimo to react.
4. Use the displayed code to open the vault.
5. To run a live Twitch integration test, clone the deployed source branch and follow README.en.md with your own Twitch Developer application and test channel. Local development does not require the hosted dashboard password.
6. For a real Twitch and OBS demonstration without local setup, watch the linked video. The protected hosted dashboard is for the project team; the no-login public demo is available to everyone.

## Video outline (target runtime: 2:40; maximum: under 3:00)

Use [VIDEO-SCRIPT.md](VIDEO-SCRIPT.md) for the timed shot list and narration.

Record in 16:9 with clear English narration or English subtitles. Use your own Twitch test channel and a second viewer account. Keep API keys, Twitch device codes, dashboard password, private overlay URL, email addresses, and personal chat messages out of frame. Do not use copyrighted music or unlicensed third-party assets.

- **0:00–0:15 — The problem and idea.** Show the stream and say: “Fast Twitch chats are hard to follow. Nexo turns viewers into a team solving a live escape room.”
- **0:15–0:45 — Real Twitch chat.** Show the streamer connected to Twitch, then send one actual viewer command such as !examinar [object]. Show that the real chat event appears and advances the room.
- **0:45–1:15 — OBS overlay.** Show the same room in OBS. Solve one clue and show a visible clue reveal or scene effect.
- **1:15–1:45 — Streamer control and variety.** Show the streamer choosing a different scenario template and starting a new room. Briefly point out the optional AI mode and free template fallback; do not expose the API key.
- **1:45–2:15 — Participation and Mimo.** Use a safe !estilo ... command and !reacciona. Show Mimo's visual reaction and the vault progress.
- **2:15–2:40 — Built with Codex.** Show the Codex project conversation and a short view of the code or changes. Explain that Codex helped build the Twitch integration, game flow, overlay, and UI. Avoid showing secret values.

Replace bracketed command placeholders with the live room's actual object names. Keep the final edit under three minutes and upload it to YouTube with **Public** visibility.

## Final submission checklist

- [ ] Link the deployed branch, not the stale default main branch.
- [ ] Keep the public demo accessible without login and without a paid API.
- [ ] Include this project's feature description and accurate Codex workflow.
- [ ] Enter the Codex session ID above.
- [ ] Upload a YouTube video under three minutes with public visibility.
- [ ] Show real Twitch functionality and Codex in the video.
- [ ] Provide English narration/subtitles and English testing instructions.
- [ ] Check all links in a signed-out browser and hide all credentials.
- [ ] Confirm the team representative and each member meet the official eligibility rules.
- [ ] Submit before the posted deadline.
