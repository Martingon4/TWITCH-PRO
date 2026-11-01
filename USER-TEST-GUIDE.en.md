# Nexo user test — streamer and viewer flows

Nexo turns a stream into a cooperative escape room. The streamer chooses a scenario; the Twitch chat investigates clues, solves puzzles, opens a vault, changes visual effects, and asks Mimo—the visual Co-Caster—to react.

## Links

- Public no-login demo: https://twitch-pro.onrender.com/demo
- Protected streamer dashboard: https://twitch-pro.onrender.com/
- Deployed source: https://github.com/Martingon4/TWITCH-PRO/tree/codex/online-render

The public demo runs template scenarios in the visitor's browser. It does not connect to Twitch, call Gemini/OpenAI, or save progress. Use the protected dashboard for live Twitch and OBS testing.

Judges who want to test live Twitch can clone the deployed source branch and run it locally with their own Twitch Developer application. Local development does not require the hosted shared password. See README.en.md for setup.

## A. Test as a viewer without installing anything

1. Open the public demo link.
2. Choose one of the eight scenario cards or type a short situation.
3. Select **Create room** and review the story, the objects, and the first suggested command.
4. Follow the command displayed in the room. Object names and puzzle answers vary by scenario.
5. Try !ayuda, !examinar [object], !resolver [object] [answer], !pista, !codigo [code], !estilo [style], and !reacciona.
6. Observe the clue reveals, team progress, vault animation, Three.js effects, and Mimo reactions.

Messages in this demo are simulated locally. They are not sent to Twitch.

## B. Test as a streamer with Twitch

### Before you start

- Use the private password to open the Render dashboard.
- The channel owner needs access to the registered Twitch app and must approve the device authorization flow.
- Use a second Twitch account as the viewer account.
- Install Node.js 22+ only if you are running the source locally.

Do not publish the dashboard password, private OBS overlay URL, device codes, Twitch tokens, or API keys. Only the streamer connects the Twitch account; viewers just use chat.

### Connect a channel and start a room

1. Sign into https://twitch-pro.onrender.com/.
2. Select **Connect Twitch**, open Twitch Activate, and authorize the requested read scopes.
3. Wait until the dashboard shows the channel as connected.
4. Choose a scenario or describe a situation and create a room. **Free template** mode does not call an AI API. **AI · with credits** sends a request to the selected provider and may use its quota.
5. In OBS, add a **Browser Source** and paste the private overlay URL copied from the connected dashboard. Do not use localhost when the app is hosted on Render.
6. From the second Twitch account, send commands shown in the room, such as !examinar [object] and !resolver [object] [answer].
7. Solve all three clues, then enter the room's displayed code with !codigo [code]. Try !estilo ..., !reacciona, and !tema ....

A !tema ... suggestion appears for the streamer to review; it does not start a new room automatically. Mimo is displayed in the dashboard and OBS overlay. It does not write to Twitch chat.

### Optional: test Gemini

In the protected dashboard, select **AI · with credits**, choose Gemini, and enter a scenario. The request uses the key configured in Render and can consume Google AI quota. The public demo does not expose AI generation. If generation fails, the dashboard explains the failure and loads a playable template.

### Optional: test channel points

Create custom Twitch rewards named exactly Nexo · Pista, Nexo · Estilo, Nexo · Tema, and Nexo · Mimo. Re-authorize the channel if necessary, then redeem each reward from a second account. Nexo listens for redemptions but does not create or manage Twitch rewards.

## C. Optional: verify streamer isolation

1. Authorize two different test channels, each with its own streamer session.
2. Create a room and send chat commands in both channels.
3. Confirm that each channel keeps separate room, progress, and chat data.

The app stores data by Twitch User ID and encrypts Twitch tokens in PostgreSQL. This prototype still uses a shared dashboard password; each streamer connects their own Twitch channel.

## Acceptance checklist

- [ ] A new viewer can play the public demo without logging in.
- [ ] The dashboard distinguishes free templates from API-powered generation.
- [ ] The streamer can connect Twitch and receive real channel chat.
- [ ] Chat commands affect the correct room and open its vault code.
- [ ] The OBS overlay follows the connected room.
- [ ] Mimo and visual styles make chat participation visible without executing chat-supplied code.
- [ ] Two test channels keep their data separate.
- [ ] A tester can explain Nexo's value to a streamer after trying it.

## Known limitations

- The public demo is a local simulation with no Twitch connection or persistence.
- The streamer dashboard uses a shared password and individual Twitch authorization.
- AI generation may use the quota of the provider configured by the account owner.
- Recent chat context may be sent to the selected AI provider for Mimo responses; do not send private information.
- Nexo is designed to encourage participation and watchability; it does not prove an increase in views or audience size.
- Render's free instance may sleep and its database has retention/resource limits. Check current plan terms before relying on the service after the hackathon.
