# Migration: Firestore -> PostgreSQL

## Prerequisites
1. Docker Compose running (PostgreSQL)
2. NestJS backend started once (creates tables via synchronize)
3. Firebase service account key at `scripts/serviceAccountKey.json`

## Steps
1. Get service account key from Firebase Console -> Project Settings -> Service Accounts -> Generate
2. Save as `backend/scripts/serviceAccountKey.json`
3. Start Docker: `docker compose up -d`
4. Start backend once: `cd backend && npm run start:dev` (creates tables), then stop
5. Run migration: `cd backend && npm run migrate:firestore`
6. Verify counts in the output
7. Users will need to reset passwords (temporary hash generated)

## Post-migration
- Set `VITE_USE_API=true` in frontend `.env.local`
- Restart frontend
