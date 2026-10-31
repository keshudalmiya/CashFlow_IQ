# Technical Requirements Document (TRD)
## ATM Cash Demand Predictor

## 1. Purpose

This document defines the technical approach for implementing the product described in `01_PRD.md` and the user-provided SRS. Preserve working code in the existing repository; inspect the codebase and current API contracts before changing architecture.

## 2. Architecture

```text
Browser
  └── React + TypeScript + Vite + Tailwind UI
        └── HTTPS/REST JSON + authentication token
              └── FastAPI application
                    ├── Authentication / authorization
                    ├── ATM and transaction services
                    ├── Feature validation / preprocessing
                    ├── Random Forest inference (scikit-learn / Joblib)
                    ├── Risk and refill calculation
                    └── PostgreSQL persistence
```

The browser must not receive model files, database credentials, password hashes, or server secrets. The API is the authoritative source for predictions, risk, refill, and persistence.

## 3. Technology baseline

Use existing repository versions where practical; do not upgrade major versions without a reason.
- Frontend: React, TypeScript, Vite.
- Styling: Tailwind CSS or the styling system already configured.
- Routing: React Router if already present; otherwise add a stable client-side router.
- Charts: Recharts or the chart library already in the repository.
- Icons: Lucide React or the existing icon package.
- API: Python FastAPI with Uvicorn.
- ML: pandas, NumPy, scikit-learn, Joblib.
- Database: PostgreSQL, using the project's existing ORM/driver (SQLAlchemy/SQLModel or equivalent).
- Authentication: JWT bearer tokens; passwords hashed with a suitable password-hashing library such as bcrypt/Argon2.
- Tests: existing test framework; pytest for backend and Vitest/React Testing Library for frontend where appropriate.
- Version control: Git.

The SRS lists PostgreSQL as the primary database and MySQL as a possible alternative. Prefer PostgreSQL unless the existing implementation requires otherwise.

## 4. Frontend structure (suggested)

```text
client/
  src/
    app/              # router, providers, app setup
    components/
      layout/         # Sidebar, Topbar, PageHeader
      ui/             # Button, Input, Badge, Card, Table, Dialog
      feedback/       # Loading, EmptyState, ErrorState
    features/
      auth/
      overview/
      atms/
      predictions/
      refills/
      data-explorer/
      analytics/
      history/
      settings/
    lib/              # API client, formatters, validation
    hooks/
    types/
    styles/
```

Adapt to the current folder structure instead of duplicating equivalent components.

## 5. Backend structure (suggested)

```text
server/
  app/
    main.py
    api/
      routes/
    core/             # config, security, exceptions
    db/               # connection, session, migrations
    models/           # database entities
    schemas/           # request/response validation
    services/
      auth_service.py
      atm_service.py
      prediction_service.py
      risk_service.py
      analytics_service.py
    ml/
      model_loader.py
      feature_builder.py
      inference.py
    tests/
```

Use the actual existing backend directory if different. Keep routes thin; business logic belongs in services.

## 6. API contract requirements

Final endpoint names must be reconciled with the existing backend before frontend implementation. Suggested REST contract:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/login` | Authenticate administrator |
| POST | `/api/auth/logout` | Invalidate session if server-side revocation is supported |
| GET | `/api/auth/me` | Current administrator profile |
| GET | `/api/health` | Basic API health |
| GET | `/api/system/status` | API/database/model/feature status |
| GET | `/api/overview` | KPI, trend, risk, attention and recent-prediction data |
| GET | `/api/atms` | Paginated/searchable/filterable ATM list |
| GET | `/api/atms/{atm_id}` | ATM details |
| GET | `/api/atms/{atm_id}/transactions` | Related transactions |
| GET | `/api/atms/{atm_id}/predictions` | ATM prediction history |
| GET | `/api/transactions` | Paginated source transaction explorer |
| GET | `/api/features` | Engineered feature explorer, if supported |
| POST | `/api/predictions` | Request and persist a prediction |
| GET | `/api/predictions` | Searchable prediction history |
| GET | `/api/predictions/{prediction_id}` | Prediction details |
| GET | `/api/refills` | Refill recommendation queue |
| PATCH | `/api/refills/{prediction_id}` | Update review status if this workflow is implemented |
| GET | `/api/analytics` | Time-series and model metrics |
| PATCH | `/api/auth/me` | Update permitted profile fields |
| POST | `/api/auth/change-password` | Change password, if implemented |

Use consistent pagination (`page`, `page_size`), sorting, filtering, and response envelopes. Do not add every suggested endpoint blindly; inspect the current project and implement only those needed by the actual features.

### Example prediction request

```json
{
  "atm_id": "ATM001",
  "prediction_period": "next_7_days"
}
```

The period is illustrative. Define the supported period and the model's actual forecasting horizon explicitly. Do not imply that a single-row regression model automatically produces a multi-day forecast unless the backend implements that behavior.

### Example prediction response

```json
{
  "prediction_id": "pred_example",
  "atm_id": "ATM001",
  "predicted_demand": 120000,
  "current_balance": 42000,
  "risk_level": "HIGH",
  "recommended_refill": 102000,
  "predicted_at": "2026-10-27T10:00:00Z"
}
```

Example values are illustrative only. API currency values should be numeric and timestamps ISO 8601. The UI formats INR locally.

### API behavior
- Validate request and response schemas.
- Use appropriate HTTP status codes.
- Return actionable but non-sensitive error messages.
- Protect operational endpoints with authentication.
- Do not return stack traces or secrets to clients.
- Use deterministic API response shapes and document them.

## 7. ML integration

- Load the trained model and feature configuration on backend startup or through a controlled lazy-loading service.
- Verify model file existence, compatibility, and expected feature list.
- The feature builder must produce exactly the 10 features and order specified in the SRS.
- Reject missing, non-finite, or invalid features with clear errors.
- Do not retrain the model during an ordinary prediction request.
- Record model version or artifact identifier where feasible.
- Report MAE, RMSE, and R² from a documented evaluation procedure; never fabricate them.
- Treat prediction output as a forecast, not a guarantee.

## 8. Security and privacy

- Keep secrets in environment variables or a secret manager; commit only `.env.example`.
- Hash passwords; never store plaintext passwords.
- Use short-lived JWTs and an explicit token storage strategy. Prefer secure, HttpOnly cookies if the backend supports them; otherwise document the risks and protect token handling.
- Enforce authorization on the server.
- Validate inputs and use parameterized ORM/database operations.
- Configure CORS for known frontend origins.
- Use HTTPS in deployment.
- Avoid logging passwords, JWTs, or sensitive records.
- Rate-limit login and other abuse-prone endpoints where feasible.
- Do not expose model files or raw database connections to the client.

## 9. Reliability and performance

Targets inherited from the SRS and subject to measurement:
- Dashboard load under 3 seconds on a standard development machine.
- Single prediction API response under 1 second on a standard development machine.
- Clear degraded status if database/model is unavailable.
- Paginate large tables; avoid fetching the full dataset into the browser.
- Add database indexes for common ATM, timestamp, and foreign-key lookups.
- Add request timeouts and safe retry behavior; do not automatically repeat non-idempotent prediction requests without considering duplicate records.

## 10. Environment configuration

Create a documented `.env.example` with placeholders only, such as:
- `DATABASE_URL`
- `JWT_SECRET`
- `ACCESS_TOKEN_EXPIRE_MINUTES`
- `MODEL_PATH`
- `FEATURES_PATH`
- `CORS_ORIGINS`
- `API_BASE_URL` (frontend build-time variable if required)

Never put real secrets in source control. Confirm the exact names from the current repository before adopting them.

## 11. Testing requirements

- Unit tests: risk rules, refill formula, feature ordering, validation, currency/format helpers.
- API tests: login, protected endpoints, valid/invalid prediction, database failure, model unavailable.
- Frontend tests: route rendering, forms, filters, loading/error/empty states, prediction result rendering.
- Integration test: prediction request → model inference → risk/refill calculation → database save → history retrieval.
- Manual QA: desktop and mobile widths, keyboard navigation, contrast, long tables, session expiry.
- Build/lint/test commands must be taken from the actual package scripts and project configuration.

## 12. Deployment notes

Deployment is optional for the academic prototype. If deployed, use separate frontend/backend configuration, managed PostgreSQL with restricted access, HTTPS, environment secrets, and health checks. Do not promise a free deployment tier until current provider limits are checked.
