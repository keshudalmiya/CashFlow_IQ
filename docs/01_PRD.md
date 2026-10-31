# Product Requirements Document (PRD)
## ATM Cash Demand Predictor
**Product type:** Academic decision-support web application  
**Primary users:** Banking operations administrator; system maintainer  
**Reference design:** User-provided dashboard collage, `ATM Cash Demand Predictor Dashboard Suite(1).png`  
**Related source:** ATM Cash Demand Predictor SRS, IEEE Std 830-1998 academic format

---

## 1. Product vision

Build a professional banking operations console that helps administrators estimate near-term ATM cash demand, identify cash-out risk, and review recommended refill amounts. The application uses historical transaction data and a trained Random Forest model. It is a **decision-support prototype**: it does not control ATM hardware, load cash, process banking transactions, or connect to a live core-banking system.

## 2. Problem statement

ATM cash demand changes with time, day of week, holidays, location, and historical withdrawal patterns. Manual estimation can lead to cash-outs or unnecessary cash held in ATMs. The product should make historical data, demand forecasts, risk classification, and refill recommendations understandable from one interface.

## 3. Goals and success criteria

### Product goals
1. Allow an authorized administrator to inspect ATM network status.
2. Generate and display a demand prediction for a selected ATM.
3. Compare predicted demand with current cash balance and classify risk.
4. Calculate a recommended refill amount using the documented business rule.
5. Store prediction results and provide history and analytics.
6. Communicate API, database, model, and feature-configuration status clearly.

### Acceptance criteria
- An administrator can log in and access protected pages.
- Overview displays API-backed KPIs, service status, demand trend, risk distribution, and ATMs requiring attention.
- A valid prediction returns predicted demand, balance, risk, refill recommendation, and timestamp.
- Successful prediction records can be retrieved from history.
- ATM search and relevant filters work.
- Missing or invalid input, unavailable model, and database/API failures produce useful error states.
- The production frontend build succeeds and core routes are tested.
- All visible values are real API data or explicitly labeled placeholders/demo data.

### Metrics to report, not assume
- Forecast evaluation: MAE, RMSE, and R².
- Target discussed in the SRS: forecast accuracy of 85% or above, dependent on dataset quality. Do not claim this target has been achieved until measured on a hold-out dataset.
- Performance targets from the SRS: dashboard load under 3 seconds and single prediction API response under 1 second on a standard development machine. Measure these during testing rather than presenting them as guaranteed.

## 4. Users and permissions

### Administrator
- Sign in and sign out.
- View network KPIs and system status.
- Search and inspect ATMs.
- Explore transaction data and engineered features.
- Request predictions and view risk/refill results.
- Review refill recommendations.
- View analytics and prediction history.
- Update permitted profile/preferences.

### Maintainer / developer
- Configure and monitor API, database, and model availability.
- Inspect system health and feature configuration.
- Does not access or control core banking systems through this prototype.
- Do not expose sensitive configuration values or model files in the browser.

Role-based permission boundaries should be enforced by the backend, not only hidden in the UI.

## 5. Scope

### In scope
- Authentication and protected routes.
- Historical ATM data ingestion/validation and exploration.
- Feature preparation consistent with the model's training feature order.
- Random Forest inference through the backend.
- Rule-based risk classification.
- Refill recommendation calculation.
- Overview dashboard, ATM network/details, data explorer, predictions, refill actions, analytics, prediction history, and settings.
- Persistent prediction records.
- Clear service status and failure states.

### Out of scope
- Direct control of ATM hardware or cash-loading machines.
- Core banking transaction processing and live payment processing.
- Live bank data feeds unless separately integrated and approved.
- Automatic physical refill execution.
- Claims that the model guarantees cash availability or a specific accuracy.

## 6. Information architecture / required pages

1. **Login** — username/password, show/hide password, validation, error state, secure sign-in.
2. **Overview Dashboard** — total ATMs, High/Medium/Low risk counts, network balance, forecast demand, recommended refill, prediction count, 14-day actual-vs-predicted trend, risk distribution, attention table, recent predictions, system health.
3. **ATM Network** — searchable/paginated ATM list; filters for city, risk, and status where supported; balance and risk; open ATM details. A map is optional and should only be included if valid coordinates or a reliable geocoding source exists.
4. **Predictions** — select ATM and supported prediction period; request prediction; show demand, balance, risk, refill and timestamp; show clear validation/error states.
5. **ATM Details** — ATM identity/location, current balance, latest prediction, risk, refill suggestion, demand trend, related transactions and prediction history when data is available.
6. **Refill Actions** — prioritized recommendations, balance, predicted demand, suggested refill, risk, review status. “Mark reviewed” is a workflow action, not proof that cash has physically been delivered.
7. **Data Explorer** — separate source transactions and engineered features; search, filters, pagination, validation indicators, missing/duplicate counts if supplied by backend.
8. **Analytics** — demand trend, risk over time, ATM comparisons, MAE/RMSE/R² and model evaluation date where available.
9. **Prediction History** — timestamp, ATM, demand, balance, risk, refill, filters, pagination, detail view.
10. **Settings** — profile, security/session options, system status, model/feature status and preferences supported by the backend.

## 7. UX direction from the provided image

Treat the provided 10-screen collage as the primary visual reference:
- Dark navy vertical sidebar with a compact product identity and clear active navigation item.
- White/light-gray content area, navy headings, blue primary actions.
- Compact top bar with page title, search where useful, notifications if implemented, and administrator profile.
- Structured KPI cards, clean charts, tables, filters, and small status badges.
- Red = High risk, amber = Medium risk, green = Low risk/healthy, blue = primary actions.
- Login uses a branded split layout with a clean form panel.
- Reuse the shell across internal pages, but adapt the page content to each task.
- Keep it human-designed: restrained effects, consistent spacing, sensible density, readable type, purposeful icons, and no excessive glassmorphism or gradients.
- The collage contains illustrative sample values. Never copy those values into live metrics as if they were real.

## 8. Product behavior and business rules

### Risk classification from the SRS
Let `D` be predicted demand and `B` be current balance:
- **HIGH:** `B < D`
- **MEDIUM:** `B < 1.5 × D`, provided the HIGH condition is false
- **LOW:** otherwise

Implement this ordering explicitly. Define safe behavior for `D <= 0`, missing balance, invalid values, and rounding.

### Refill recommendation from the SRS
- `required_cash = predicted_demand × 1.2`
- `recommended_refill = max(0, required_cash − current_balance)`

Use one canonical backend implementation and return the calculated result to the UI. Format displayed currency in INR, but keep numeric values in API payloads.

### Prediction features
The SRS states that the trained model expects these 10 engineered features in the saved training order:
`hour`, `day_of_week`, `is_weekend`, `is_holiday`, `totalBalance`, `numberOutcomeTransaction`, `totalNumberTransaction`, `previous_demand`, `previous_transaction_count`, `rolling_mean_3`.

The backend must validate these features and their order against the saved feature configuration. Do not silently substitute arbitrary values.

## 9. UI states and accessibility

Every data-driven page should handle:
- Initial loading / skeleton.
- Loaded data.
- Empty dataset / no search results.
- Validation errors.
- API/network errors with retry where safe.
- Unauthorized/expired session.
- Partial service outage, especially database/model unavailable.
- Long labels, large values, narrow screens, and table overflow.

Use keyboard-operable controls, visible focus states, semantic headings, associated form labels, sufficient contrast, and risk text labels in addition to color.

## 10. Risks and dependencies

- Dataset quality and schema may differ from the model's expected features.
- Accuracy depends on representative historical data and valid train/test evaluation.
- Current ATM balance freshness is not guaranteed unless a real feed is integrated.
- Database availability affects persistence and history.
- Credentials and secrets must remain in environment variables and never be committed.
- UI implementation depends on confirmed backend API contracts.

## 11. Release priorities

### P0 — Minimum usable product
Authentication, app shell, Overview, ATM Network, Predictions, risk/refill logic, backend integration, prediction persistence, error states.

### P1 — Complete core workflows
ATM Details, Refill Actions, Prediction History, Data Explorer.

### P2 — Reporting and polish
Analytics, Settings, responsive refinements, accessibility review, export only if implemented and tested.

## 12. Definition of done

A page is done only when its route renders, design matches the shared visual system, loading/empty/error states exist, controls work, API-backed values are not hardcoded, access is appropriate, and its key workflow has been tested.
