# Nexo user test — streamer and viewer flows

Nexo turns a stream into a cooperative escape room. The streamer chooses a scenario; the Twitch chat investigates clues, solves puzzles, opens a vault, changes visual effects, and asks Mimo—the visual Co-Caster—to react.

## Links

- Public no-login demo: https://twitch-pro.onrender.com/demo
- Streamer dashboard (Twitch sign-in): https://twitch-pro.onrender.com/
- Deployed source: https://github.com/Martingon4/TWITCH-PRO/tree/codex/online-render

The public demo runs template scenarios in the visitor's browser. It does not connect to Twitch, call Gemini/OpenAI, or save progress. Use the Twitch sign-in dashboard for live Twitch and OBS testing.

Judges who want to test live Twitch can clone the deployed source branch and run it locally with their own Twitch Developer application. Local development does not require a hosted account. See README.en.md for setup.

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

- Sign in to the Render dashboard with the Twitch account that manages the test channel.
- The channel owner needs access to the registered Twitch app and must approve the device authorization flow.
- Use a second Twitch account as the viewer account.
- Install Node.js 22+ only if you are running the source locally.

Do not publish the private OBS overlay URL, device codes, Twitch tokens, or API keys. Only the streamer authorizes the channel; viewers join through chat.

### Connect a channel and start a room

1. Open https://twitch-pro.onrender.com/. On the welcome screen, choose **ENTRAR COMO STREAMER CON TWITCH** under “Quiero usarlo con mi canal.”
2. Open Twitch Activate and authorize the requested read scopes for the channel.
3. Wait until the dashboard shows the channel as connected. The session is tied to this Twitch account. Viewers who only want to try the game can choose **PROBAR COMO ESPECTADOR** instead; that path opens the browser simulation.
4. Choose a scenario or describe a situation and create a room. **Free template** mode does not call an AI API. **AI · with credits** sends a request to the selected provider and may use its quota.
5. Choose a 3-, 4-, or 5-minute limit (4 minutes by default). Creating a room prepares the timer but does not start it; it begins when someone sends `!examinar [object]` and reveals the first clue. The countdown and visual warnings appear in the scene and OBS at one minute, 30 seconds, and 10 seconds. Nexo does not post warning messages to Twitch chat. If time expires, the round fails and the streamer can restart it.
6. In OBS, add a **Browser Source** and paste the private overlay URL copied from the connected dashboard. Do not use localhost when the app is hosted on Render.
7. From the second Twitch account, send commands shown in the room, such as !examinar [object] and !resolver [object] [answer].
8. Solve all three clues, then enter the room's displayed code with !codigo [code]. Try !estilo ..., !reacciona, and !tema ....

A !tema ... suggestion appears for the streamer to review; it does not start a new room automatically. Mimo is displayed in the dashboard and OBS overlay. It does not write to Twitch chat.

### Optional: test Gemini

In the streamer dashboard, select **AI · with credits**, choose Gemini, and enter a scenario. The request uses the key configured in Render and can consume Google AI quota. The public demo does not expose AI generation. If generation fails, the dashboard explains the failure and loads a playable template.

### Optional: test channel points

Create custom Twitch rewards named exactly Nexo · Pista, Nexo · Estilo, Nexo · Tema, and Nexo · Mimo. Re-authorize the channel if necessary, then redeem each reward from a second account. Nexo listens for redemptions but does not create or manage Twitch rewards.

## C. Optional: verify streamer isolation

1. Authorize two different test channels, each with its own streamer session.
2. Create a room and send chat commands in both channels.
3. Confirm that each channel keeps separate room, progress, and chat data.

The app stores data by Twitch User ID and encrypts Twitch tokens in PostgreSQL. Each streamer signs in with their own Twitch account. Twitch identifies Partner and Affiliate accounts, but that classification does not cover every streamer; an offline or unaffiliated streamer can still use the streamer flow. Viewers use the public demo without authorizing Nexo.

## Acceptance checklist

- [ ] A new viewer can play the public demo without logging in.
- [ ] The dashboard distinguishes free templates from API-powered generation.
- [ ] The streamer can connect Twitch and receive real channel chat.
- [ ] Chat commands affect the correct room and open its vault code.
- [ ] The OBS overlay follows the connected room.
- [ ] Panel and OBS show the same countdown; timeout displays the failure effect and allows a retry.
- [ ] Mimo and visual styles make chat participation visible without executing chat-supplied code.
- [ ] Two test channels keep their data separate.
- [ ] A tester can explain Nexo's value to a streamer after trying it.

## Known limitations

- The public demo is a local simulation with no Twitch connection or persistence.
- The streamer dashboard uses individual Twitch authorization; viewers can use the public simulation without signing in.
- AI generation may use the quota of the provider configured by the account owner.
- Recent chat context may be sent to the selected AI provider for Mimo responses; do not send private information.
- Nexo is designed to encourage participation and watchability; it does not prove an increase in views or audience size.
- Render's free instance may sleep and its database has retention/resource limits. Check current plan terms before relying on the service after the hackathon.
