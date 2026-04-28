# PRATHOMIX — Deployment Guide

## Prerequisites
- Docker + Docker Compose installed
- Supabase project created (https://supabase.com)
- Groq API key (https://console.groq.com)
- Gemini API key (https://aistudio.google.com)

---

## 1. Local Development

```bash
# Generate the codebase
python3 build_prathomix_fullstack.py

# Validate environment
make validate-env

# Install and run
make install
make dev
```

URLs:
- Frontend: http://localhost:5173
- API:      http://localhost:8000/api/docs

---

## 2. Docker (Full Stack)

```bash
# Configure both env files
cp backend/.env.example backend/.env    # fill in all keys
cp frontend/.env.example frontend/.env  # fill in Supabase keys

# Build and launch
make docker-build
make docker-up
```

URLs:
- Frontend: http://localhost
- API:      http://localhost:8000/api/docs

---

## 3. Production (VPS / Cloud)

### Option A — Single VPS (recommended for MVP)

```bash
# On your server
git clone https://github.com/prathomix/prathomix /opt/prathomix
cd /opt/prathomix

# Fill in production .env files
nano backend/.env
nano frontend/.env

# Launch
docker compose up -d --build

# Set up Nginx reverse proxy + Let's Encrypt SSL
sudo apt install nginx certbot python3-certbot-nginx
sudo certbot --nginx -d prathomix.xyz -d www.prathomix.xyz
```

### Option B — Vercel (frontend) + Railway (backend)

Frontend on Vercel:
```bash
cd frontend
npx vercel --prod
# Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel dashboard
```

Backend on Railway:
```bash
railway login
railway init
railway up  # from backend/ directory
# Set all .env variables in Railway dashboard
```

### Option C — GitHub Actions CI/CD (automated)

The `.github/workflows/deploy.yml` workflow automatically:
1. Builds Docker images on push to `main`
2. Pushes to Docker Hub
3. SSHes into your server and runs `docker compose up -d`

Required GitHub Secrets:
- `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN`
- `DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_SSH_KEY`
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`

---

## 4. Supabase Setup

1. Create a new project at https://supabase.com
2. Go to SQL Editor and run:
   - `supabase/schema.sql`
   - `supabase/analytics_schema.sql`
   - `supabase/payments_schema.sql`
3. Copy these to your `.env` files:
   - Project URL
   - anon/public key (frontend)
   - service role key (backend)
   - JWT secret (backend)

---

## 5. Environment Variables Checklist

Run `make validate-env` before every deploy.

| Variable | Where | Required |
|---|---|---|
| `GROQ_API_KEY` | backend | ✅ |
| `GEMINI_API_KEY` | backend | ✅ |
| `SUPABASE_URL` | both | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | backend | ✅ |
| `SUPABASE_JWT_SECRET` | backend | ✅ |
| `VITE_SUPABASE_ANON_KEY` | frontend | ✅ |
| `STRIPE_SECRET_KEY` | backend | Optional |
| `RESEND_API_KEY` | backend | Optional |
| `REDIS_URL` | backend | Optional |

---

## 6. Post-Deploy Checklist

- [ ] `GET /api/health` returns `{"status": "operational"}`
- [ ] SmartBot responds in the frontend
- [ ] User can register and sign in
- [ ] Admin dashboard accessible at /admin
- [ ] Contact form submits successfully
- [ ] Supabase RLS policies active (verify in dashboard)
- [ ] SSL certificate installed and auto-renewing
- [ ] Docker health checks passing (`docker compose ps`)

---

## 7. Monitoring

```bash
# View live logs
docker compose logs -f backend
docker compose logs -f frontend

# Check health
curl https://prathomix.xyz/api/health

# Check metrics (if MetricsMiddleware enabled)
curl https://prathomix.xyz/api/metrics
```

---

## Support
- Email: hello@prathomix.xyz
- Founder: pratham@prathomix.xyz
- WhatsApp: https://wa.me/919999999999
