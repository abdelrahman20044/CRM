# CRM frontend

React and Vite interface for the CRM REST API. See the [root README](../README.md) for backend, MongoDB, and Docker setup.

## Local development

Use Node.js 20.19+ on the 20.x line, or 22.12+, as required by the locked Vite version. In a terminal at the repository root:

```bash
cd frontend
npm ci
npm run dev
```

From `CRM/backend`, use `cd ../frontend` instead. Keep the backend running at `http://localhost:3000` in another terminal or through Docker Compose. Compose starts the backend and MongoDB only.

Open `http://localhost:5173`. Vite proxies `/api` to the local backend. The Axios client defaults to `/api/v1`; leave `VITE_API_URL` unset for this local setup. Keep port 5173 to match the backend's local CORS origin.

## Available checks

Run inside `frontend/`:

```bash
npm run lint
npm run build
npm run preview
```

`build` creates ignored output in `dist/`. `preview` serves that build for inspection; the development API proxy is configured under `server` and does not apply to preview. There is currently no frontend test or format script.

## Vercel deployment

The frontend and backend deploy independently. Set `VITE_API_URL` to the backend's full API base URL, including `/api/v1`, when building for a separate backend origin. Vite embeds this value into the browser bundle; do not put secrets in `VITE_` variables. `vercel.json` rewrites frontend routes to `index.html` for client-side navigation.
