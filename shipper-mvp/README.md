# Shipper Chat MVP

A simple real-time chat app built with Next.js, Socket.IO, Prisma/PostgreSQL, and Google OAuth (with JWT).

## Features

- **Auth:** Google sign-in; JWT stored in httpOnly cookie
- **User list:** All users with online/offline status (via WebSockets)
- **Chat:** Click a user to start or continue a conversation; messages persist in the DB and sync in real time
- **Chat with AI (bonus):** Dedicated “Chat with AI” in the sidebar; history stored in the same DB (optional OpenAI API key)

## Setup

1. **Environment**

   Copy `.env.example` to `.env` and set:

   - `DATABASE_URL` – PostgreSQL connection string (e.g. [Neon](https://neon.tech), [Supabase](https://supabase.com), or local Postgres)
   - `NEXT_PUBLIC_GOOGLE_CLIENT_ID` – from [Google Cloud Console](https://console.cloud.google.com/) (OAuth 2.0 Client ID, Web application)
   - `GOOGLE_CLIENT_SECRET` – same Google OAuth client
   - `JWT_SECRET` – e.g. `openssl rand -base64 32`
   - `OPENAI_API_KEY` (optional) – for “Chat with AI”; if missing, AI replies with a “not configured” message

2. **Database**

   From the `shipper-mvp` folder:

   ```bash
   npm run db:push
   # or
   npm run db:migrate
   ```

3. **Run**

   ```bash
   npm install
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000). Sign in with Google, then open the chat and pick a user or “Chat with AI”.

## Scripts

- `npm run dev` – Custom server (Next.js + Socket.IO) on port 3000
- `npm run build` – Next.js production build (set `DATABASE_URL` for collect phase)
- `npm run start` – Production server (set `NODE_ENV=production` on your host)
- `npm run db:generate` – Generate Prisma client
- `npm run db:push` – Push schema to DB (no migrations)
- `npm run db:migrate` – Run migrations
- `npm run db:seed` – Run seed script

## Deployment

This app uses a **custom Node server** (Next + Socket.IO on one port). It cannot run on Vercel (serverless). Use a Node host that runs `node server.js`, e.g. Railway, Render, Fly.io, or a VPS. Set `DATABASE_URL`, `JWT_SECRET`, and Google OAuth redirect URI for your production URL.

## Bonus ideas (for future work)

- **Chat with AI** – Implemented (optional OpenAI; history in DB)
- **Unread badges** – Show unread count per conversation or user
- **Typing indicators** – Broadcast “user is typing” over Socket.IO
- **Image/file upload** – Attach files; store URLs in DB and files in S3 (or similar)
- **Search** – Search messages or users
- **Notifications** – Browser or push when a new message arrives while offline
- **Reactions / seen state** – Simple reactions or “last read” message id per user
