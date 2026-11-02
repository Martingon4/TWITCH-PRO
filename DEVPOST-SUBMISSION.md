# Devpost submission package — Nexo

Use this draft in the Devpost form. Confirm the project details and eligibility before submitting.

## Project title

Nexo: A Cooperative Escape Room for Twitch Chat

## One-line description

Turn a Twitch stream into a live, chat-driven escape room where viewers investigate clues, unlock a vault, reshape the scene, and react with Mimo.

## Team

- Martin Gonzalez Muñoz
- Enrique Hernandez Luna

## Project description

Nexo gives Twitch streamers a cooperative escape-room format built around their live community. A streamer chooses a scenario and adds the game as an OBS browser overlay. Viewers use Twitch chat commands to inspect objects, solve clues against a 3–5 minute countdown that begins with the first examination, collect a vault code, request hints, and trigger safe visual styles. Mimo, a visual Co-Caster, reacts to chat and game events.

The app connects to Twitch using device authorization and EventSub chat and channel-point events. PostgreSQL separates each channel’s room and progress. Streamers can use free templates or optionally generate an original room with Gemini or OpenAI. The public demo is a no-login template simulation and does not require Twitch authorization or an AI API key.

## How we used OpenAI Codex

We used OpenAI Codex to plan the streamer and viewer flows, build the Node.js application and Twitch integration, develop the Three.js scene and OBS overlay, add persistent multi-channel storage, and improve the interface. The team reviewed and refined the resulting implementation.

## Links

- Repository branch: https://github.com/Martingon4/TWITCH-PRO/tree/codex/online-render
- Public demo (no login): https://twitch-pro.onrender.com/demo
- Streamer dashboard: https://twitch-pro.onrender.com/
- Public YouTube demo: https://youtu.be/Y5xiUa65oXw (Public; 2:59, checked in YouTube Studio)

**Video evidence gap:** The uploaded cut demonstrates the Nexo app, but does not visibly show a real Twitch chat event reflected in OBS or the Codex development session. Record and replace the video with those two short shots if the challenge requires them. Do not describe the current cut as showing them.

## Codex session ID

01a18e06-1e5c-7330-bd62-3c58f1ea522c

## Judge test instructions

1. Open the public demo; no account is required.
2. Choose a scenario and select **Crear sala**.
3. Follow the on-screen object names and commands to examine objects, solve clues, request a hint, trigger a visual style, and ask Mimo to react.
4. Use the displayed code and instructions to open the vault.
5. For a live Twitch test, follow README.en.md using your own Twitch Developer application and test channel. The hosted public demo is a simulation, not a live Twitch session.

## Final checks

- Confirm the app and repository links are accessible to judges.
- Add the team members and representative in Devpost; verify eligibility and the official rules.
- The video is public and under three minutes, but should be replaced if a visible Twitch and Codex demonstration is required.
- Submit the project before the official deadline.
