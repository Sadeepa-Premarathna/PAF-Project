# Frontend (Ready To Run)

This `frontend/` directory is now a complete React + Vite app.

## Run

```bash
npm install
npm run dev
```

Frontend starts at `http://localhost:3000`.

## API base URL

The app reads either:

- `VITE_API_BASE_URL` (Vite style)
- `REACT_APP_API_BASE_URL` (CRA-compatible fallback)

Default `.env`:

```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
```
