# Deployment

This project has a production Docker setup in `docker-compose.prod.yml`.

## Required files

1. Create a root `.env.production` from `.env.production.example`.
2. Place the backend runtime secrets in `backend/.env`.

`backend/.env` must contain at least:

```env
JWT_SECRET=your_long_random_secret
GEMINI_API_KEY=your_real_gemini_key
FRONTEND_ORIGIN=https://your-domain.tld
PORT=3001
```

`docker-compose.prod.yml` overrides `DATABASE_URL`, so the backend can still use the internal Docker hostname `postgres`.

## Start

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
```

## Verify

```bash
docker compose -f docker-compose.prod.yml ps
docker logs garage_backend --tail 100
docker logs garage_frontend --tail 100
curl -I http://127.0.0.1:3000
curl -I http://127.0.0.1:3001/health
```

## Notes

- `RUN_DB_SEED=false` by default so deploys do not wipe application data.
- Frontend public URLs are injected at build time, so if the domain changes you must rebuild the frontend image.
