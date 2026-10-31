# Implementation Plan
## ATM Cash Demand Predictor — Antigravity AI

## 1. Implementation objective

Use the supplied UI/UX reference image and the PRD/TRD in this folder to improve or build the application incrementally. First inspect the repository and preserve working code. Do not replace functioning features merely to match a screenshot.

## 2. Mandatory instruction to the coding agent

Before coding:
1. Inspect the repository tree, package scripts, dependencies, environment examples, backend routes, database models, tests, and existing UI.
2. Read all six requirement documents and open `ATM Cash Demand Predictor Dashboard Suite(1).png`.
3. Compare existing implementation against requirements.
4. Produce a short gap analysis and proposed file-level change list.
5. Confirm actual API paths and response schemas from source code. Treat suggested endpoints in the TRD as proposals until verified.
6. Do not reveal or overwrite secrets. Do not print `.env` contents.

## 3. Phases

### Phase 0 — Repository audit
**Tasks**
- Inspect frontend and backend architecture.
- Identify existing working routes and components.
- Confirm model files, feature configuration, dataset schema, and backend run commands.
- Check database connectivity/configuration without exposing credentials.
- Identify broken build/tests and record baseline.

**Exit criteria**
- Gap analysis created.
- Existing behavior and API contracts documented.
- No destructive changes made.

### Phase 1 — Design foundation and app shell
**Tasks**
- Establish design tokens and typography from `04_UI_UX_DESIGN.md`.
- Build/refine Sidebar, Topbar, page header, shared cards, buttons, badges, tables, form controls, skeletons, empty states, and error states.
- Implement responsive shell and protected-route behavior using existing authentication.
- Match the supplied reference: navy sidebar, light content area, restrained blue actions.

**Exit criteria**
- Shell works on desktop and mobile widths.
- Active navigation and routes are correct.
- Keyboard focus and labels are usable.
- Existing build passes.

### Phase 2 — Login and Overview
**Tasks**
- Implement login form and authentication states.
- Connect Overview to real API data.
- Add KPI cards, 14-day demand chart, risk distribution, attention table, recent predictions, and service health.
- Handle each widget's loading, empty, and error states.
- Do not use reference-image numbers as production values.

**Exit criteria**
- Login works against the actual backend.
- Overview uses live API responses or explicit empty states.
- No fake operational values.
- Routes and tests pass.

### Phase 3 — ATM Network and ATM Details
**Tasks**
- Implement server-side search, filters, sorting and pagination as supported.
- Show ATM identity, city/address, current known balance, risk/status.
- Implement details page and demand/history sections where APIs support them.
- Add a map only if valid coordinates and a map provider/configuration are available.

**Exit criteria**
- Search and pagination work.
- Row-to-detail navigation works.
- Missing data is represented honestly.

### Phase 4 — Predictions workflow
**Tasks**
- Build ATM selection and supported prediction-horizon form.
- Connect to the real prediction endpoint.
- Verify the model expects the 10 documented features in the correct order.
- Display demand, balance, risk, refill and timestamp.
- Implement loading, invalid input, model unavailable, API failure and persistence failure states.
- Confirm risk/refill calculations on the backend.

**Exit criteria**
- A valid request returns and displays a real result.
- Prediction is persisted and appears in history.
- Unit and integration tests cover risk/refill logic and feature validation.
- UI does not claim an unsupported forecast horizon.

### Phase 5 — Refill Actions and Prediction History
**Tasks**
- Build recommendation queue and risk/status filters.
- Add a review action only if a backend endpoint and persisted status exist.
- Build history table, filters, pagination and detail view.
- Clearly distinguish recommendation review from physical cash delivery.

**Exit criteria**
- Data comes from persisted records.
- Review status changes persist if the feature is enabled.
- Historical records are not silently rewritten.

### Phase 6 — Data Explorer and Analytics
**Tasks**
- Implement transaction and engineered-feature tabs.
- Use server-side pagination and filtering.
- Display data-quality summaries only when available.
- Build demand trends, risk distribution, ATM comparisons and model evaluation metrics.
- Show MAE/RMSE/R² only when computed from a documented evaluation dataset.

**Exit criteria**
- Large datasets are paginated.
- Charts use API data.
- Empty or unavailable metrics are labeled honestly.

### Phase 7 — Settings and hardening
**Tasks**
- Implement profile, security, system status and model info that are supported by the backend.
- Verify secrets are not exposed.
- Check session expiration, protected routes, authorization and CORS.
- Add accessibility and responsive refinements.
- Remove duplicate React keys, console errors, unused code and misleading controls.

**Exit criteria**
- Settings controls work or are clearly read-only.
- No critical console errors.
- Auth and system status behavior are tested.

### Phase 8 — Final verification and demo readiness
**Tasks**
- Run project-defined lint, type-check, test, and production build commands.
- Test the main workflow end to end.
- Verify all 10 routes and key interactions.
- Test with backend/database/model unavailable.
- Check desktop, tablet and mobile widths.
- Prepare a short README with setup, environment variables, run commands, test commands and known limitations.

**Exit criteria**
- Build and tests pass, or remaining failures are documented accurately.
- No credentials committed.
- No fake live metrics.
- Demo workflow is repeatable.

## 4. End-to-end demonstration scenario

1. Start the backend and database.
2. Start the frontend.
3. Log in using a configured test administrator.
4. Open Overview and confirm the source of the visible data.
5. Search for an ATM in ATM Network.
6. Open its details.
7. Request a prediction using a supported horizon.
8. Verify predicted demand, current balance, risk and refill calculation.
9. Confirm the prediction was saved.
10. Open Prediction History and locate the record.
11. Open Refill Actions and review the recommendation if supported.
12. Open Analytics and verify metric provenance.
13. Test a controlled failure (for example, unavailable model/database in a test environment) and verify the UI explains the issue.

Use only non-sensitive test data in demonstrations.

## 5. Definition of done for each phase

- Requirements traceable to a working page/API/test.
- No regression in previously working features.
- TypeScript/Python types and validation are respected.
- Loading, empty, and error states implemented.
- Real backend integration or explicit “not configured” state.
- Responsive and keyboard-usable controls.
- Build/tests run using commands from the repository.
- Changes and known limitations summarized.

## 6. Suggested Antigravity execution prompt

```text
You are working on the ATM Cash Demand Predictor project.

Read these files before implementing:
- 01_PRD.md
- 02_TRD.md
- 03_APP_FLOW.md
- 04_UI_UX_DESIGN.md
- 05_BACKEND_SCHEMA.md
- 06_IMPLEMENTATION_PLAN.md
- ATM Cash Demand Predictor Dashboard Suite(1).png

The image is the primary UI/UX reference. Match its professional navy sidebar, light content panels, blue primary actions, risk badges, readable tables, charts and 10-page information architecture. Do not copy illustrative values into real API data. Avoid excessive glassmorphism, gradients, glowing effects and generic AI styling.

First inspect the existing repository, identify current working features, actual routes, API contracts, database schema, model artifacts and test commands. Produce a gap analysis before making changes. Preserve working code and avoid destructive rewrites.

Implement one phase at a time according to 06_IMPLEMENTATION_PLAN.md. After each phase, run the relevant tests/build and report:
1. Files changed
2. Features completed
3. Tests and commands run
4. Failures or unresolved dependencies
5. Next phase

Do not invent endpoints, dataset columns, metrics, ATM locations or operational status. If an API or feature does not exist, either implement it consistently across backend/frontend or mark it as pending. Never expose secrets. Keep the application a decision-support prototype; it must not imply control of real ATM hardware or physical cash replenishment.
```

## 7. Suggested milestone checklist

- [x] Phase 0 — Repository audit (Completed: requirements, schema, and baseline audited)
- [x] Phase 1 — Design foundation and app shell (Completed: dark navy sidebar, cards, tokens, responsive shell)
- [x] Phase 2 — Login and Overview (Completed: JWT authentication, overview KPIs, 14-day trend, risk donut, attention table)
- [x] Phase 3 — ATM Network and Details (Completed: search/filters, interactive map view, paginated table, ATM details tabs)
- [x] Phase 4 — Predictions (Completed: model inference on 10 exact features, risk rules, refill calculation, persistence)
- [x] Phase 5 — Refill Actions and History (Completed: prioritized recommendation queue, review status mutations, audit modal)
- [x] Phase 6 — Data Explorer and Analytics (Completed: source transactions, engineered features, holdout metrics MAE/RMSE/R²)
- [x] Phase 7 — Settings and hardening (Completed: admin profile, password change, live system status, preferences)
- [x] Phase 8 — Final verification and demo readiness (Completed: 11 pytest backend tests passing, frontend production build passing)

## 8. Important implementation notes

- Build on the existing codebase; do not assume the project is greenfield.
- Use the reference image for visual direction, while keeping the UI responsive and accessible.
- Confirm the real dataset and model input contract before changing feature engineering.
- The model's accuracy must be evaluated; do not state that it reaches 85% unless measured.
- A recommendation is not a physical refill event.
- Deployment is optional for the academic prototype and should be considered after local integration and testing are reliable.
