# VJEditor

Create. Edit. Automate.

Phase 1 frontend for a web-based AI video creation and editing workspace.

## Stack

- React 19 + TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide icons

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Scripts

- `npm run dev` — development server
- `npm run build` — typecheck and production build
- `npm run preview` — preview the production build

The editor uses localStorage as a resilient cache and syncs project metadata to the Spring Boot API
when running locally. Vite proxies `/api` to `http://localhost:8080` during development.

## Publish with GitHub Pages

1. Create a GitHub repository and push this project to its `main` branch.
2. In GitHub, open **Settings > Pages** and set the source to **GitHub Actions**.
3. The workflow in `.github/workflows/deploy-pages.yml` will build and publish the app.

The published frontend uses hash routing so project pages work on GitHub Pages. The Spring Boot API
still needs its own public deployment; without `VITE_API_URL`, the published app uses local browser
storage and the demo backend is not reachable from GitHub Pages.

## Backend foundation

The Spring Boot REST foundation is in `backend/`. It currently provides in-memory project CRUD:

```bash
cd backend
mvn spring-boot:run
```

The frontend HTTP client is available in `src/services/api.ts`; the local project service remains the
active UI adapter until PostgreSQL-backed persistence is introduced.
