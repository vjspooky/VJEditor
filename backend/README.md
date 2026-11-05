# VJEditor API

Spring Boot REST foundation for VJEditor.

## Requirements

- Java 17+
- Maven 3.9+

## Run

```bash
mvn spring-boot:run
```

The API listens on `http://localhost:8080`.

Development authentication defaults to `admin` / `VJEditorFree2026!`. Set these before running
outside local development:

```powershell
$env:VJEDITOR_AUTH_USERNAME = "your-user"
$env:VJEDITOR_AUTH_PASSWORD = "your-password"
$env:VJEDITOR_JWT_SECRET = "a-long-random-secret-at-least-32-characters"
```

## Endpoints

- `GET /api/projects`
- `GET /api/projects/{id}`
- `POST /api/projects`
- `PUT /api/projects/{id}`
- `DELETE /api/projects/{id}`
- `POST /api/auth/login`

Project routes require `Authorization: Bearer <token>`. H2 is used by default for local development;
activate the `postgres` profile and set `DATABASE_URL`, `DATABASE_USERNAME`, and `DATABASE_PASSWORD`
for PostgreSQL.

## Hosted deployment

The backend can run as a Docker service on Render, Railway, or another container host. Set
`SPRING_PROFILES_ACTIVE=postgres`, `DATABASE_URL` to a JDBC PostgreSQL URL, `DATABASE_USERNAME`,
`DATABASE_PASSWORD`, `VJEDITOR_AUTH_USERNAME`, `VJEDITOR_AUTH_PASSWORD`, `VJEDITOR_JWT_SECRET`, and
`VJEDITOR_FRONTEND_ORIGINS` to the deployed frontend origin.
