# Anonymous Chat

Anonymous Chat is a lightweight, fully anonymous, real-time chat web app built with Node.js, Express and Socket.IO. Users can join without registration, choose temporary nicknames, create/join rooms (including private temporary rooms), and chat in real time. All data is stored in temporary in-memory storage and deleted when rooms are empty or on server restart.

Tagline: JOIN · TALK · DISAPPEAR

Live features
- Anonymous entry with temporary username and avatar
- Global lobby and default rooms: 🌎 General, 🎮 Gaming, 🎵 Music, 😂 Random, 💭 Talk
- Create private temporary rooms with an invite code
- Real-time multi-user chat across devices and networks using Socket.IO
- Rooms are auto-deleted when empty; temporary rooms have an immediate deletion and an optional abandoned timeout
- Basic moderation: report, mute, kick, rate-limiting, profanity filtering, XSS protection
- Responsive dark UI with glassmorphism and neon accents

Getting started

1. Install

```bash
npm install
```

2. Run

```bash
npm start
```

3. Open your browser at http://localhost:3000 (or the URL/port provided by your hosting platform).

Deployment

- The server listens on process.env.PORT || 3000 so it is compatible with most Node.js hosting providers (Heroku, Render, Fly, etc.).
- Ensure port is exposed by your hosting platform. If using a reverse proxy or a managed platform, follow their Socket.IO configuration guidance (most work out of the box).

Security & Privacy

- No permanent accounts. Usernames, messages and rooms are ephemeral in server memory only.
- The server may log ephemeral metadata (IP, timestamps) for security/rate-limiting, but messages are not persisted.
- Basic profanity filtering and rate-limits are enforced server-side.

Moderation

- Users can report messages and users. Reports are stored in-memory and can be extended to send to external moderation channels.
- Room owners can kick or mute users inside their room.
- Spam protection by rate-limiting messages per user.

Configuration

- ROOM_CLEANUP_MS: (default 10 minutes) - cleanup timeout for unused temporary rooms. Temporary rooms are deleted immediately when empty; this is an extra safety timer for abandoned artifacts.
- MESSAGE_RATE_LIMIT: (default 5 messages / 10 seconds) - adjust in server.js

Notes

- This project intentionally uses in-memory storage to preserve anonymity and to keep the project simple to host. Do not use this for production without adding persistent storage and strong moderation.

