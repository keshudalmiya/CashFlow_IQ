# UI/UX Design Specification
## ATM Cash Demand Predictor

## 1. Source of truth

Use the user-provided image `ATM Cash Demand Predictor Dashboard Suite(1).png` as the primary visual reference. It is a 10-screen collage covering Login, Overview, ATM Network, Predictions, ATM Details, Refill Actions, Data Explorer, Analytics, Prediction History, and Settings. Match its overall design language, not its illustrative sample data.

## 2. Visual direction

**Style:** professional enterprise banking operations console; restrained, practical, data-first.

- Dark navy vertical sidebar.
- Light main content area with white cards.
- Blue primary buttons and active navigation.
- Subtle borders and minimal shadows.
- Readable typography and moderate information density.
- Red/amber/green risk states.
- Consistent icon style.
- No excessive glassmorphism, neon glow, huge gradients, or decorative animation.
- Avoid the generic “AI-generated SaaS template” look by prioritizing real workflows, consistent alignment, realistic table density, and purposeful empty states.

## 3. Design tokens

Suggested starting tokens; adjust to existing design system if already present.

```css
:root {
  --navy-950: #101B31;
  --navy-900: #14233C;
  --blue-600: #2563EB;
  --blue-700: #1D4ED8;
  --page-bg: #F3F6FA;
  --surface: #FFFFFF;
  --text-primary: #172033;
  --text-secondary: #667085;
  --border: #E2E8F0;
  --risk-high: #DC2626;
  --risk-medium: #D97706;
  --risk-low: #16A34A;
  --focus-ring: #93C5FD;
}
```

### Typography and spacing
- Use Inter or a similar neutral sans-serif.
- Page title: approximately 22–28 px, weight 600–700.
- Section headings: approximately 15–18 px, weight 600.
- Body/table text: typically 13–15 px; avoid unreadably small text.
- Use an 8 px spacing rhythm.
- Card padding: typically 16–20 px.
- Sidebar: approximately 220–250 px on desktop; collapsible on narrower screens.
- Border radius: modest (8–12 px), consistent across components.

## 4. Shared application shell

### Sidebar
Product identity: “ATM Cash Demand Predictor” with a simple bank/ATM icon.
Navigation order:
1. Overview
2. ATM Network
3. Predictions
4. Refill Actions
5. Analytics
6. Data Explorer
7. Prediction History
8. Settings
9. Logout

Highlight the active page with a blue or blue-tinted background. Keep labels visible on desktop. Use accessible names if the sidebar collapses.

### Top bar
- Current page title or breadcrumb.
- Global ATM search only where useful.
- Notification control only if notifications exist.
- Administrator avatar/name and profile menu.
- Avoid inactive decorative controls that look functional.

### Main content
- Page title and concise supporting description.
- Primary action aligned consistently.
- Filters close to the table/chart they control.
- Use tables for operational records and charts for trends.
- Keep the main action obvious on each page.

## 5. Page-by-page specifications

### 5.1 Login
- Branded split-screen layout inspired by the reference.
- Left navy/brand panel with concise product value statement; imagery is optional and must not distract.
- Right white form panel.
- Username and password fields, show/hide password, submit button, inline validation, loading and error state.
- Do not add a “Forgot password” workflow unless a real reset flow exists.
- Do not include “Remember me” unless session behavior is implemented.

### 5.2 Overview Dashboard
- Page title: Overview.
- KPI row: Total ATMs, High Risk, Medium Risk, Low Risk; secondary metrics can include Network Balance, Forecast Demand, Recommended Refill, Prediction Records.
- Main chart: Actual vs Predicted Cash Demand for the selected period (SRS specifies last 14 days).
- Side panel: Risk Distribution.
- Attention table: ATM ID, location, current balance, predicted demand, risk, recommended refill, action.
- Recent Predictions table.
- System status strip: API, Database, ML Model, Feature Configuration.
- Keep hierarchy clear; do not force every possible metric into the first viewport.

### 5.3 ATM Network
- Title and concise network description.
- Search by ATM ID, name, city, or address.
- Filters only for fields the backend supports.
- Table columns: ATM ID, ATM/name/location, city, current balance, risk/status, action.
- Pagination and loading/empty/error states.
- Map is optional and requires trustworthy coordinates; do not invent ATM coordinates.

### 5.4 Predictions
- Left or upper form: ATM selector and supported prediction horizon.
- Primary action: “Predict Cash Demand”.
- Result area: Predicted Demand, Current Balance, Risk Level, Recommended Refill, Prediction Timestamp.
- Explain risk result briefly.
- Disable repeat submission while a request is in progress.
- Preserve form values when a recoverable API error occurs.
- Show historical demand chart only when the endpoint provides relevant data.

### 5.5 ATM Details
- Breadcrumb/back link to ATM Network.
- ATM ID, name, location, status.
- Metric cards for current balance, predicted demand, recommended refill, last prediction.
- Tabs or sections: Demand Trend, Transactions, Prediction History, Location/Info.
- Show “not available” when fields are absent rather than making up values.

### 5.6 Refill Actions
- Table/queue of recommendations.
- Filters for risk, workflow status, and city if supported.
- Columns: ATM, location, current balance, predicted demand, recommended refill, priority, review status, action.
- “Mark Reviewed” must update a real backend status. Do not imply that this physically refills the ATM.
- Make high-priority rows visible without relying on color alone.

### 5.7 Data Explorer
- Tabs: Transaction Data and Engineered Features.
- Search, date range, ATM filters and pagination.
- Show record count and data quality summary when available.
- Use sticky table headers only when useful.
- Avoid downloading all rows to the browser.
- Make the difference between source columns and ML features clear.

### 5.8 Analytics
- Date-range selector.
- Model evaluation cards: MAE, RMSE, R², and accuracy only if the project's evaluation method defines it.
- Actual vs Predicted Demand chart.
- Risk Distribution Over Time.
- Top high-demand ATMs.
- Every metric should include its source/period where useful.
- Do not invent metrics to fill cards.

### 5.9 Prediction History
- Filters: search, date range, risk.
- Table: Date & Time, ATM ID, Predicted Demand, Current Balance, Risk, Recommended Refill, Action.
- Pagination and detail view.
- Use consistent INR and timezone formatting.
- Clearly distinguish historical prediction results from current ATM balance.

### 5.10 Settings
- Tabs or sections: Profile, Security, System Status, Model Info, Preferences.
- Display API/database/model/feature status.
- Do not expose secrets, full connection strings, or server paths.
- Only show controls that work with backend support.

## 6. Components to build once

- `AppShell`, `Sidebar`, `Topbar`, `PageHeader`
- `KpiCard`, `RiskBadge`, `ServiceStatus`
- `DataTable`, `Pagination`, `SearchInput`, `FilterBar`
- `DateRangeFilter`, `CurrencyValue`, `MetricValue`
- `ChartCard`, `EmptyState`, `LoadingSkeleton`, `ErrorState`
- `ConfirmDialog`, `Toast/InlineAlert`, `FormField`
- `ProtectedRoute`

Use shared components for consistency but allow page-specific layouts.

## 7. Charts and data visualization

- Use legible axes, clear legends, and restrained gridlines.
- Distinguish actual and predicted demand with two consistent series.
- Use red/amber/green for risk only; do not use these colors arbitrarily for unrelated series.
- Provide text labels or summaries for important chart conclusions.
- Include loading, no-data, and failure states.
- Do not render fabricated chart points when the API returns no data.

## 8. Responsive behavior

- Desktop: persistent sidebar and multi-column dashboard.
- Tablet: collapsible sidebar and fewer columns.
- Mobile: compact header, navigation drawer, stacked KPI cards, horizontally scrollable or card-based tables.
- Forms should remain usable with touch input.
- Avoid horizontal overflow of the whole page.

## 9. Accessibility and quality

- Use semantic HTML and correct heading order.
- Associate labels with form controls.
- Ensure keyboard navigation and visible focus.
- Meet WCAG AA contrast where practical.
- Pair risk colors with text.
- Use meaningful icon labels and button names.
- Support zoom and reasonable text sizes.

## 10. Avoid these design mistakes

- A separate visual style on every page.
- Too many equally prominent KPI cards.
- Decorative charts with fake data.
- Unnecessary gradients, blur, glassmorphism, glowing effects, and animation.
- Tiny table text.
- Buttons that do nothing.
- Fake map locations or fake operational status.
- Hardcoded sample metrics presented as real data.
- Replacing the existing app wholesale without checking working functionality first.
