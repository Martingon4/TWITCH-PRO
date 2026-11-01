import { randomBytes, createCipheriv, createDecipheriv, createHash, createHmac } from "node:crypto";
import pg from "pg";

const { Pool } = pg;
export const persistenceEnabled = Boolean(process.env.DATABASE_URL);
const memory = {
  streamers: new Map(), flows: new Map(), rooms: new Map(), game: new Map(), chat: new Map(), events: [], leases: new Map(), nextEventId: 1,
};

function encryptionKey() {
  const configured = process.env.TOKEN_ENCRYPTION_KEY || "";
  if (configured.length < 32) {
    throw new Error("TOKEN_ENCRYPTION_KEY debe tener al menos 32 caracteres para proteger los tokens de Twitch.");
  }
  return createHash("sha256").update(configured).digest();
}

const pool = persistenceEnabled
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.DB_POOL_MAX || 10),
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 10_000,
      ssl: process.env.DATABASE_SSL === "true" ? { rejectUnauthorized: false } : undefined,
    })
  : null;

function seal(value) {
  if (!value) return null;
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", encryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(String(value), "utf8"), cipher.final()]);
  return [iv, cipher.getAuthTag(), encrypted].map((part) => part.toString("base64url")).join(".");
}

function unseal(value) {
  if (!value) return null;
  const [iv, tag, encrypted] = String(value).split(".").map((part) => Buffer.from(part, "base64url"));
  const decipher = createDecipheriv("aes-256-gcm", encryptionKey(), iv);
  decipher.setAuthTag(tag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

function copy(value) { return value == null ? value : structuredClone(value); }
function streamerFromRow(row) {
  if (!row) return null;
  return {
    id: row.twitch_user_id,
    login: row.login,
    display_name: row.display_name,
    accessToken: unseal(row.access_token_enc),
    refreshToken: unseal(row.refresh_token_enc),
    expiresAt: row.token_expires_at ? new Date(row.token_expires_at).getTime() : 0,
    status: row.status || "disconnected",
    rewardsAvailable: Boolean(row.rewards_available),
    rewardsError: row.rewards_error || null,
  };
}

export async function initializeStore() {
  if (!pool) return;
  encryptionKey();
  await pool.query(`
    CREATE TABLE IF NOT EXISTS streamers (
      twitch_user_id TEXT PRIMARY KEY,
      login TEXT NOT NULL,
      display_name TEXT NOT NULL,
      access_token_enc TEXT,
      refresh_token_enc TEXT,
      token_expires_at TIMESTAMPTZ,
      status TEXT NOT NULL DEFAULT 'disconnected',
      rewards_available BOOLEAN NOT NULL DEFAULT FALSE,
      rewards_error TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE TABLE IF NOT EXISTS streamer_state (
      twitch_user_id TEXT PRIMARY KEY REFERENCES streamers(twitch_user_id) ON DELETE CASCADE,
      room JSONB,
      game_state JSONB,
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE streamer_state ADD COLUMN IF NOT EXISTS game_state JSONB;
    CREATE TABLE IF NOT EXISTS device_flows (
      id TEXT PRIMARY KEY,
      device_code_enc TEXT NOT NULL,
      user_code TEXT NOT NULL,
      verification_uri TEXT NOT NULL,
      interval_seconds INTEGER NOT NULL,
      next_poll_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      error TEXT,
      streamer_id TEXT REFERENCES streamers(twitch_user_id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    ALTER TABLE device_flows ADD COLUMN IF NOT EXISTS streamer_id TEXT REFERENCES streamers(twitch_user_id) ON DELETE SET NULL;
    CREATE TABLE IF NOT EXISTS chat_messages (
      id BIGSERIAL PRIMARY KEY,
      twitch_user_id TEXT NOT NULL REFERENCES streamers(twitch_user_id) ON DELETE CASCADE,
      twitch_message_id TEXT,
      user_name TEXT NOT NULL,
      user_login TEXT,
      message_text TEXT NOT NULL,
      source TEXT NOT NULL DEFAULT 'twitch',
      sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      UNIQUE (twitch_user_id, twitch_message_id)
    );
    CREATE INDEX IF NOT EXISTS chat_messages_streamer_recent ON chat_messages (twitch_user_id, sent_at DESC);
    CREATE TABLE IF NOT EXISTS stream_events (
      id BIGSERIAL PRIMARY KEY,
      twitch_user_id TEXT NOT NULL REFERENCES streamers(twitch_user_id) ON DELETE CASCADE,
      source_event_id TEXT,
      event_type TEXT NOT NULL,
      payload JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
    CREATE UNIQUE INDEX IF NOT EXISTS stream_events_deduplicate ON stream_events (twitch_user_id, source_event_id) WHERE source_event_id IS NOT NULL;
    CREATE INDEX IF NOT EXISTS stream_events_poll ON stream_events (id);
    CREATE TABLE IF NOT EXISTS streamer_leases (
      twitch_user_id TEXT PRIMARY KEY REFERENCES streamers(twitch_user_id) ON DELETE CASCADE,
      owner_id TEXT NOT NULL,
      lease_until TIMESTAMPTZ NOT NULL
    );
    CREATE TABLE IF NOT EXISTS streamer_controllers (
      twitch_user_id TEXT PRIMARY KEY REFERENCES streamers(twitch_user_id) ON DELETE CASCADE,
      client_id TEXT NOT NULL,
      owner_id TEXT NOT NULL,
      lease_until TIMESTAMPTZ NOT NULL
    );
  `);
}

export async function closeStore() { if (pool) await pool.end(); }

export async function pruneStore() {
  if (!pool) return;
  await pool.query("DELETE FROM stream_events WHERE created_at < NOW() - INTERVAL '1 day'");
  await pool.query("DELETE FROM chat_messages WHERE sent_at < NOW() - INTERVAL '7 days'");
  await pool.query("DELETE FROM device_flows WHERE created_at < NOW() - INTERVAL '1 day'");
}

export async function createDeviceFlow(flow) {
  if (!pool) { memory.flows.set(flow.id, { ...flow }); return; }
  const record = { ...flow, deviceCodeEnc: seal(flow.deviceCode) };
  await pool.query(`INSERT INTO device_flows (id, device_code_enc, user_code, verification_uri, interval_seconds, next_poll_at, expires_at)
    VALUES ($1,$2,$3,$4,$5,NOW(),$6)`, [flow.id, record.deviceCodeEnc, flow.userCode, flow.verificationUri, flow.interval, new Date(flow.expiresAt)]);
}

function flowFromRow(row) {
  return row && {
    id: row.id, deviceCode: unseal(row.device_code_enc), userCode: row.user_code, streamerId: row.streamer_id || null,
    verificationUri: row.verification_uri, interval: row.interval_seconds,
    nextPollAt: new Date(row.next_poll_at).getTime(), expiresAt: new Date(row.expires_at).getTime(),
    status: row.status, error: row.error,
  };
}

export async function getDeviceFlow(id) {
  if (!pool) return copy(memory.flows.get(id) || null);
  return flowFromRow((await pool.query("SELECT * FROM device_flows WHERE id=$1", [id])).rows[0]);
}

export async function claimDevicePoll(id, nextPollAt) {
  if (!pool) {
    const flow = memory.flows.get(id);
    if (!flow || flow.status !== "pending" || flow.expiresAt <= Date.now() || flow.nextPollAt > Date.now()) return null;
    flow.nextPollAt = nextPollAt;
    return copy(flow);
  }
  const result = await pool.query(`UPDATE device_flows SET next_poll_at=$2
    WHERE id=$1 AND status='pending' AND expires_at>NOW() AND next_poll_at<=NOW() RETURNING *`, [id, new Date(nextPollAt)]);
  return flowFromRow(result.rows[0]);
}

export async function updateDeviceFlow(id, patch) {
  if (!pool) {
    const flow = memory.flows.get(id);
    if (!flow) return;
    Object.assign(flow, patch);
    return;
  }
  await pool.query("UPDATE device_flows SET status=COALESCE($2,status), error=$3, interval_seconds=COALESCE($4,interval_seconds), streamer_id=COALESCE($5,streamer_id) WHERE id=$1", [id, patch.status || null, patch.error ?? null, patch.interval ?? null, patch.streamerId || null]);
}

export async function upsertStreamer(user, token) {
  const record = {
    id: String(user.id), login: String(user.login), display_name: String(user.display_name),
    accessToken: token.access_token, refreshToken: token.refresh_token,
    expiresAt: Date.now() + (Number(token.expires_in) || 14_400) * 1000,
    status: "connecting", rewardsAvailable: false, rewardsError: null,
  };
  if (!pool) { memory.streamers.set(record.id, record); return record; }
  await pool.query(`INSERT INTO streamers (twitch_user_id,login,display_name,access_token_enc,refresh_token_enc,token_expires_at,status)
    VALUES ($1,$2,$3,$4,$5,$6,'connecting')
    ON CONFLICT (twitch_user_id) DO UPDATE SET login=EXCLUDED.login,display_name=EXCLUDED.display_name,
    access_token_enc=EXCLUDED.access_token_enc,refresh_token_enc=EXCLUDED.refresh_token_enc,
    token_expires_at=EXCLUDED.token_expires_at,status='connecting',rewards_available=FALSE,rewards_error=NULL,updated_at=NOW()`,
  [record.id, record.login, record.display_name, seal(record.accessToken), seal(record.refreshToken), new Date(record.expiresAt)]);
  await pool.query("INSERT INTO streamer_state (twitch_user_id) VALUES ($1) ON CONFLICT DO NOTHING", [record.id]);
  return record;
}

export async function getStreamer(id) {
  if (!id) return null;
  if (!pool) return copy(memory.streamers.get(String(id)) || null);
  return streamerFromRow((await pool.query("SELECT * FROM streamers WHERE twitch_user_id=$1", [String(id)])).rows[0]);
}

export async function findStreamerByLogin(login) {
  if (!login) return null;
  if (!pool) return [...memory.streamers.values()].find((streamer) => streamer.login.toLowerCase() === String(login).toLowerCase()) || null;
  return streamerFromRow((await pool.query("SELECT * FROM streamers WHERE LOWER(login)=LOWER($1)", [String(login)])).rows[0]);
}

export async function connectedStreamers() {
  if (!pool) return [...memory.streamers.values()].filter((streamer) => streamer.refreshToken && streamer.status !== "reauthorization_required").map(copy);
  return (await pool.query("SELECT * FROM streamers WHERE refresh_token_enc IS NOT NULL AND status <> 'reauthorization_required'")).rows.map(streamerFromRow);
}

export async function setStreamerStatus(id, status, rewardsAvailable = false, rewardsError = null) {
  if (!pool) {
    const streamer = memory.streamers.get(String(id));
    if (streamer) Object.assign(streamer, { status, rewardsAvailable, rewardsError });
    return;
  }
  await pool.query("UPDATE streamers SET status=$2,rewards_available=$3,rewards_error=$4,updated_at=NOW() WHERE twitch_user_id=$1", [String(id), status, rewardsAvailable, rewardsError]);
}

export async function clearStreamerTokens(id) {
  if (!pool) {
    const streamer = memory.streamers.get(String(id));
    if (streamer) Object.assign(streamer, { accessToken: null, refreshToken: null, expiresAt: 0, status: "disconnected", rewardsAvailable: false, rewardsError: null });
    return;
  }
  await pool.query("UPDATE streamers SET access_token_enc=NULL,refresh_token_enc=NULL,token_expires_at=NULL,status='disconnected',rewards_available=FALSE,rewards_error=NULL,updated_at=NOW() WHERE twitch_user_id=$1", [String(id)]);
}

export async function getRoom(id) {
  if (!pool) return copy(memory.rooms.get(String(id)) || null);
  return (await pool.query("SELECT room FROM streamer_state WHERE twitch_user_id=$1", [String(id)])).rows[0]?.room || null;
}

export async function saveRoom(id, room) {
  if (!pool) { memory.rooms.set(String(id), copy(room)); return; }
  await pool.query("INSERT INTO streamer_state (twitch_user_id,room,game_state,updated_at) VALUES ($1,$2,NULL,NOW()) ON CONFLICT (twitch_user_id) DO UPDATE SET room=EXCLUDED.room,game_state=NULL,updated_at=NOW()", [String(id), JSON.stringify(room)]);
}

export async function getGameState(id) {
  if (!pool) return copy(memory.game.get(String(id)) || null);
  return (await pool.query("SELECT game_state FROM streamer_state WHERE twitch_user_id=$1", [String(id)])).rows[0]?.game_state || null;
}

export async function saveGameState(id, gameState) {
  if (!pool) { memory.game.set(String(id), copy(gameState)); return; }
  await pool.query("UPDATE streamer_state SET game_state=$2,updated_at=NOW() WHERE twitch_user_id=$1", [String(id), JSON.stringify(gameState)]);
}

export async function addChatMessage(id, message) {
  if (!pool) {
    const entries = memory.chat.get(String(id)) || [];
    entries.push({ ...message, sentAt: message.sentAt || new Date().toISOString() });
    memory.chat.set(String(id), entries.slice(-100));
    return true;
  }
  const result = await pool.query(`INSERT INTO chat_messages (twitch_user_id,twitch_message_id,user_name,user_login,message_text,source,sent_at)
    VALUES ($1,$2,$3,$4,$5,$6,COALESCE($7::timestamptz,NOW())) ON CONFLICT (twitch_user_id,twitch_message_id) DO NOTHING RETURNING id`,
  [String(id), message.messageId || null, String(message.user || "chat").slice(0, 64), message.login || null, String(message.text || "").slice(0, 500), message.source || "twitch", message.sentAt || null]);
  return result.rowCount > 0;
}

export async function recentChat(id, limit = 60) {
  if (!pool) return copy((memory.chat.get(String(id)) || []).slice(-limit));
  const result = await pool.query("SELECT user_name AS user, user_login AS login, message_text AS text, twitch_message_id AS \"messageId\", source, sent_at AS \"sentAt\" FROM chat_messages WHERE twitch_user_id=$1 ORDER BY sent_at DESC LIMIT $2", [String(id), limit]);
  return result.rows.reverse();
}

export async function publishEvent(streamerId, type, payload, sourceEventId = null) {
  if (!pool) {
    if (sourceEventId && memory.events.some((event) => event.streamerId === streamerId && event.sourceEventId === sourceEventId)) return null;
    const event = { id: memory.nextEventId++, streamerId: String(streamerId), type, payload: copy(payload), sourceEventId };
    memory.events.push(event);
    if (memory.events.length > 4000) memory.events.splice(0, 1000);
    return event;
  }
  const result = await pool.query(`INSERT INTO stream_events (twitch_user_id,source_event_id,event_type,payload)
    VALUES ($1,$2,$3,$4) ON CONFLICT (twitch_user_id,source_event_id) WHERE source_event_id IS NOT NULL DO NOTHING RETURNING id,twitch_user_id,event_type,payload`,
  [String(streamerId), sourceEventId, type, JSON.stringify(payload)]);
  const row = result.rows[0];
  return row ? { id: Number(row.id), streamerId: row.twitch_user_id, type: row.event_type, payload: row.payload } : null;
}

export async function latestEventId() {
  if (!pool) return memory.nextEventId - 1;
  return Number((await pool.query("SELECT COALESCE(MAX(id),0) AS id FROM stream_events")).rows[0].id);
}

export async function eventsAfter(id, limit = 500) {
  if (!pool) return memory.events.filter((event) => event.id > id).slice(0, limit).map(copy);
  const result = await pool.query("SELECT id,twitch_user_id,event_type,payload FROM stream_events WHERE id>$1 ORDER BY id LIMIT $2", [id, limit]);
  return result.rows.map((row) => ({ id: Number(row.id), streamerId: row.twitch_user_id, type: row.event_type, payload: row.payload }));
}

export async function acquireLease(streamerId, ownerId, seconds = 30) {
  if (!pool) {
    const lease = memory.leases.get(String(streamerId));
    if (lease && lease.ownerId !== ownerId && lease.until > Date.now()) return false;
    memory.leases.set(String(streamerId), { ownerId, until: Date.now() + seconds * 1000 });
    return true;
  }
  const result = await pool.query(`INSERT INTO streamer_leases (twitch_user_id,owner_id,lease_until) VALUES ($1,$2,NOW()+make_interval(secs => $3::double precision))
    ON CONFLICT (twitch_user_id) DO UPDATE SET owner_id=EXCLUDED.owner_id,lease_until=EXCLUDED.lease_until
    WHERE streamer_leases.owner_id=EXCLUDED.owner_id OR streamer_leases.lease_until<NOW() RETURNING twitch_user_id`, [String(streamerId), ownerId, seconds]);
  return result.rowCount > 0;
}

export async function releaseLeases(ownerId) {
  if (!pool) {
    for (const [id, lease] of memory.leases) if (lease.ownerId === ownerId) memory.leases.delete(id);
    return;
  }
  await pool.query("DELETE FROM streamer_leases WHERE owner_id=$1", [ownerId]);
}

export async function releaseLease(streamerId, ownerId) {
  if (!pool) {
    const lease = memory.leases.get(String(streamerId));
    if (lease?.ownerId === ownerId) memory.leases.delete(String(streamerId));
    return;
  }
  await pool.query("DELETE FROM streamer_leases WHERE twitch_user_id=$1 AND owner_id=$2", [String(streamerId), ownerId]);
}

export async function claimController(streamerId, clientId, ownerId, seconds = 20) {
  if (!pool) {
    const key = String(streamerId);
    const lease = memory.leases.get(`controller:${key}`);
    if (lease && lease.clientId !== clientId && lease.until > Date.now()) return false;
    memory.leases.set(`controller:${key}`, { clientId, ownerId, until: Date.now() + seconds * 1000 });
    return true;
  }
  const result = await pool.query(`INSERT INTO streamer_controllers (twitch_user_id,client_id,owner_id,lease_until) VALUES ($1,$2,$3,NOW()+make_interval(secs => $4::double precision))
    ON CONFLICT (twitch_user_id) DO UPDATE SET client_id=EXCLUDED.client_id,owner_id=EXCLUDED.owner_id,lease_until=EXCLUDED.lease_until
    WHERE streamer_controllers.client_id=EXCLUDED.client_id OR streamer_controllers.lease_until<NOW() RETURNING twitch_user_id`, [String(streamerId), String(clientId), ownerId, seconds]);
  return result.rowCount > 0;
}

export async function releaseController(streamerId, clientId, ownerId) {
  if (!pool) {
    const key = `controller:${streamerId}`;
    const lease = memory.leases.get(key);
    if (lease?.clientId === clientId && lease.ownerId === ownerId) memory.leases.delete(key);
    return;
  }
  await pool.query("DELETE FROM streamer_controllers WHERE twitch_user_id=$1 AND client_id=$2 AND owner_id=$3", [String(streamerId), String(clientId), ownerId]);
}

export async function isController(streamerId, clientId) {
  if (!pool) {
    const lease = memory.leases.get(`controller:${streamerId}`);
    return Boolean(lease && lease.clientId === clientId && lease.until > Date.now());
  }
  const result = await pool.query("SELECT 1 FROM streamer_controllers WHERE twitch_user_id=$1 AND client_id=$2 AND lease_until>NOW()", [String(streamerId), String(clientId)]);
  return result.rowCount > 0;
}

export function overlaySignature(secret, streamerId) {
  return createHmac("sha256", secret).update(`nexo-overlay:${streamerId}`).digest("base64url");
}
