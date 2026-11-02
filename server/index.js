import express from 'express';
import { createServer } from 'node:http';
import { Server } from 'socket.io';
import { TikTokLiveConnection, WebcastEvent, ControlEvent } from 'tiktok-live-connector';
import path from 'node:path';
import { mkdir, readFile, appendFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: false } });
app.use(express.json({ limit: '32kb' }));

let liveConnection = null;
let currentUsername = '';
let connectedAt = null;
let reconnectTimer = null;
const dataDir = path.resolve(__dirname, '../data');
const historyFile = path.join(dataDir, 'live-events.jsonl');
let eventHistory = [];
let persistQueue = Promise.resolve();
const giftTier = coins => coins >= 10000 ? 'legendary' : coins >= 1000 ? 'epic' : coins >= 100 ? 'rare' : 'common';
const publishEvent = event => {
  if (event.type === 'gift') event.tier = giftTier(Number(event.coins) || 0);
  eventHistory.push(event);
  if (eventHistory.length > 1000) eventHistory = eventHistory.slice(-1000);
  persistQueue = persistQueue.then(async () => { await mkdir(dataDir, { recursive: true }); await appendFile(historyFile, JSON.stringify(event) + '\\n', 'utf8'); }).catch(err => console.error('Cannot persist LIVE event:', err.message));
  io.emit('live:event', event);
};
try { const raw = await readFile(historyFile, 'utf8'); eventHistory = raw.split('\\n').filter(Boolean).slice(-1000).map(line => JSON.parse(line)); } catch {}

const clean = (value, max = 80) => String(value ?? '').replace(/[<>]/g, '').trim().slice(0, max);
const emitStatus = (status, extra = {}) => io.emit('live:status', { status, username: currentUsername, connectedAt, ...extra });
const disconnectLive = async () => {
  if (reconnectTimer) clearTimeout(reconnectTimer);
  reconnectTimer = null;
  const old = liveConnection;
  liveConnection = null;
  if (old) { try { await old.disconnect(); } catch {} }
  connectedAt = null;
};

app.get('/api/health', (_req, res) => res.json({ ok: true, app: 'NightClub LIVE 3D', version: '2.0.0' }));
app.get('/api/status', (_req, res) => res.json({ status: liveConnection?.isConnected ? 'connected' : 'offline', username: currentUsername, connectedAt }));
app.get('/api/history', (req, res) => { const limit = Math.min(500, Math.max(1, Number(req.query.limit) || 100)); res.json({ events: eventHistory.slice(-limit).reverse() }); });

app.post('/api/connect', async (req, res) => {
  const username = clean(req.body?.username, 40).replace(/^@/, '');
  if (!/^[a-zA-Z0-9._]{2,40}$/.test(username)) return res.status(400).json({ error: 'Username TikTok không hợp lệ.' });
  try {
    await disconnectLive();
    currentUsername = username;
    emitStatus('connecting');
    const connection = new TikTokLiveConnection(username, { enableExtendedGiftInfo: true, processInitialData: false });
    liveConnection = connection;
    connection.on(ControlEvent.CONNECTED, state => {
      connectedAt = new Date().toISOString();
      emitStatus('connected', { roomId: state.roomId, roomInfo: state.roomInfo ? { title: clean(state.roomInfo.title, 120), viewerCount: state.roomInfo.userCount ?? 0 } : null });
    });
    connection.on(ControlEvent.DISCONNECTED, ({ code, reason }) => {
      connectedAt = null;
      emitStatus('offline', { reason: clean(reason, 160), code });
    });
    connection.on(ControlEvent.ERROR, ({ info, exception }) => {
      io.emit('live:error', { message: clean(info || exception?.message || 'Lỗi kết nối TikTok LIVE.', 200) });
    });
    connection.on(WebcastEvent.CHAT, data => publishEvent({ type: 'chat', id: crypto.randomUUID(), username: clean(data.user?.uniqueId || data.user?.nickname, 40), nickname: clean(data.user?.nickname, 60), comment: clean(data.comment, 300), at: Date.now() }));
    connection.on(WebcastEvent.MEMBER, data => {
      io.emit('live:event', { type: 'member', id: crypto.randomUUID(), username: clean(data.user?.uniqueId || data.user?.nickname, 40), nickname: clean(data.user?.nickname, 60), viewerCount: Number(data.memberCount) || 0, at: Date.now() });
      if (Number(data.memberCount) > 0) io.emit('live:metrics', { viewerCount: Number(data.memberCount) });
    });
    connection.on(WebcastEvent.ROOM_USER, data => io.emit('live:metrics', { viewerCount: Number(data.viewerCount || data.total) || 0 }));
    connection.on(WebcastEvent.LIKE, data => io.emit('live:event', { type: 'like', id: crypto.randomUUID(), username: clean(data.user?.uniqueId || data.user?.nickname, 40), count: Number(data.likeCount || data.total) || 1, at: Date.now() }));
    connection.on(WebcastEvent.FOLLOW, data => io.emit('live:event', { type: 'follow', id: crypto.randomUUID(), username: clean(data.user?.uniqueId || data.user?.nickname, 40), nickname: clean(data.user?.nickname, 60), at: Date.now() }));
    connection.on(WebcastEvent.SHARE, data => io.emit('live:event', { type: 'share', id: crypto.randomUUID(), username: clean(data.user?.uniqueId || data.user?.nickname, 40), at: Date.now() }));
    connection.on(WebcastEvent.GIFT, data => {
      if (data.giftDetails?.giftType === 1 && !data.repeatEnd) return;
      const count = Math.max(1, Number(data.repeatCount) || 1);
      const giftName = clean(data.extendedGiftInfo?.name || data.giftDetails?.giftName || 'Quà TikTok', 80);
      const unitCoins = Number(data.extendedGiftInfo?.diamondCount || data.giftDetails?.diamondCount || data.giftDetails?.diamond_count) || 0;
      io.emit('live:event', { type: 'gift', id: crypto.randomUUID(), username: clean(data.user?.uniqueId || data.user?.nickname, 40), nickname: clean(data.user?.nickname, 60), giftName, count, coins: unitCoins * count, unitCoins, at: Date.now() });
    });
    await connection.connect();
    res.json({ ok: true, username });
  } catch (error) {
    await disconnectLive();
    emitStatus('offline');
    res.status(502).json({ error: clean(error?.message || 'Không thể kết nối phòng LIVE. Hãy kiểm tra username và trạng thái LIVE.', 240) });
  }
});

app.post('/api/disconnect', async (_req, res) => {
  await disconnectLive();
  emitStatus('offline');
  res.json({ ok: true });
});

if (process.env.NODE_ENV === 'production') app.use(express.static(path.resolve(__dirname, '../dist')));
const port = Number(process.env.PORT) || 4174;
httpServer.listen(port, '0.0.0.0', () => console.log('NightClub LIVE backend listening on ' + port));
process.on('SIGINT', async () => { await disconnectLive(); httpServer.close(() => process.exit(0)); });
process.on('SIGTERM', async () => { await disconnectLive(); httpServer.close(() => process.exit(0)); });
