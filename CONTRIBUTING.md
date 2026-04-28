# Contributing to PRATHOMIX

Thank you for your interest in contributing!

## Development Setup

### Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

### Backend
```bash
cd backend
cp .env.example .env
python -m venv venv && source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Tests
```bash
# Backend
cd backend && pytest tests/ -v

# Frontend
cd frontend && npm run test
```

## Code Style

**Backend (Python):**
- Follow PEP 8, enforced by Ruff (`pip install ruff && ruff check .`)
- Type annotations required on all public functions
- Docstrings on all modules and public classes

**Frontend (React/JS):**
- ESLint config in `eslint.config.js`
- Components: PascalCase files, default exports
- Hooks: camelCase prefixed with `use`
- No inline styles — use Tailwind utilities

## Branch Conventions
- `main`    — production-ready only, protected
- `develop` — integration branch
- `feat/*`  — new features
- `fix/*`   — bug fixes
- `chore/*` — non-functional changes

## Pull Request Checklist
- [ ] Tests pass: `pytest` + `npm run test`
- [ ] Linting passes: `ruff check .` + `npm run lint`
- [ ] No `.env` secrets committed
- [ ] PR description explains what and why
- [ ] Linked to a GitHub Issue if applicable

## Commit Format (Conventional Commits)
```
feat: add Gemini fallback for complex chatbot queries
fix: resolve CORS error on /api/contact POST
chore: update dependencies to latest patch versions
docs: add Supabase setup instructions to README
```

## Contact
Questions? Email pratham@prathomix.xyz or open a GitHub Issue.
