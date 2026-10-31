# CashFlow IQ — ATM Cash Demand Predictor
> **AI-Powered ATM Cash Demand Forecasting, Cash-Out Risk Detection, and Replenishment Decision Support System**

CashFlow IQ is a full-stack, machine learning-driven banking operations platform designed to help cash management teams anticipate cash demand across an ATM network, detect cash-out risks before they occur, and prioritize cash replenishment schedules with accurate, data-backed recommendations.

> **Academic Prototype Note:** CashFlow IQ is a decision-support system. It does not directly interface with physical ATM dispenser mechanisms, dispatch armored transit vehicles, or execute live core-banking ledger transactions.

---

## 1. System Architecture

```text
CashFlow IQ
├── Browser Client (React 18 + Vite + TypeScript + Recharts + Lucide Icons)
│   ├── Navy Enterprise Design System (#101B31 / #132238 / #2563EB)
│   ├── JWT Session Handling & State Management
│   └── 10 Feature-Complete Operations Pages
│
└── Backend Server (FastAPI + Python 3.13 + SQLAlchemy)
    ├── RESTful API Endpoints (/api/auth, /api/overview, /api/atms, etc.)
    ├── Decision Engine (Risk Rules & Refill Formula)
    ├── SQLite / PostgreSQL Relational Database
    └── ML Inference Engine (RandomForestRegressor on 10 Engineered Features)
```

### Folder Structure

```text
CashFlow_IQ/
├── docs/                                 # Antigravity specifications & reference collage
├── server/                               # FastAPI backend application
│   ├── app/
│   │   ├── api/routes/                   # auth, overview, atms, predictions, refills, data_explorer, analytics, system
│   │   ├── core/                         # config, database, security
│   │   ├── ml/                           # feature_builder, model_loader
│   │   ├── models/                       # SQLAlchemy models: AdminUser, ATM, ATMTransaction, Prediction
│   │   ├── schemas/                      # Pydantic request/response validation schemas
│   │   └── services/                     # Canonical risk and refill business logic
│   ├── data/                             # Realistic transactions.csv & engineered_features.csv (14,430+ records)
│   ├── models_storage/                   # Trained cash_demand_rf.joblib & model_metadata.json
│   ├── scripts/                          # generate_and_train.py (data generator, training pipeline, DB seeder)
│   ├── tests/                            # test_backend.py (11 comprehensive pytest test cases)
│   ├── requirements.txt
│   └── .env.example
├── client/                               # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── components/layout/            # AppShell (Sidebar, Topbar)
│   │   ├── components/ui/                # KpiCard, RiskBadge, Pagination, AtmNetworkMap
│   │   ├── lib/                          # api client, formatters
│   │   ├── pages/                        # All 10 application pages
│   │   ├── types/                        # Full TypeScript data definitions
│   │   ├── App.tsx                       # Main application shell & router
│   │   └── index.css                     # Custom enterprise design system
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts                    # Proxying /api to port 8000
├── .env.example                          # Root environment configuration template
└── README.md
```

---

## 2. 10 Implemented Application Pages

1. **Login Page**: Split-panel layout with branded ATM theme, username/password validation, show/hide password toggle, and JWT authentication.
2. **Dashboard (Overview)**: Total ATMs, High/Medium/Low Risk KPI cards, 14-day Actual vs Predicted demand trend line chart with splines, Risk Distribution Donut chart, and ATMs Requiring Attention priority list.
3. **ATM Network**: Filterable by City, Risk Level, and Operating Status, paired with an interactive geographic SVG map with popups and a paginated data table.
4. **Predictions Workflow**: Interactive ATM selection, horizon selection, real-time ML inference execution, predicted demand, balance used, risk score, refill recommendation, and 14-day comparison bar chart.
5. **ATM Details**: ATM banner, balance/demand metrics, and 4 dedicated tabs: *Demand Trend*, *Transactions*, *Prediction History*, and *Location Info*, with a granular Risk Analysis card.
6. **Refill Actions**: Prioritized cash replenishment recommendation queue sorted by risk and shortage amount, with filtering and functional **"Mark Reviewed"** audit state workflow.
7. **Data Explorer**: Dual-tab view toggle between raw source transactions and the 10 model features, complete with data quality indicators and pagination.
8. **Analytics & Insights**: True holdout model evaluation metrics (MAE, RMSE, R², Accuracy), actual vs predicted trend, risk distribution over time stacked bar chart, and top 5 high-demand ATMs.
9. **Prediction History**: Paginated audit table with ATM search and risk filters, plus an inspection modal showing the full 10-feature snapshot used for model inference.
10. **Settings**: Administrator profile update, password change, live System Status indicators (API Server, Database, ML Model, 10 Features count), and system preferences.

---

## 3. Machine Learning & Business Rules

### 10 Model Features in Saved Training Order
The trained `RandomForestRegressor` expects exactly these 10 features in this sequence:
1. `hour`
2. `day_of_week`
3. `is_weekend`
4. `is_holiday`
5. `totalBalance`
6. `numberOutcomeTransaction`
7. `totalNumberTransaction`
8. `previous_demand`
9. `previous_transaction_count`
10. `rolling_mean_3`

### True Holdout Evaluation Metrics (Evaluated on 20% holdout test set)
- **MAE:** ₹ 6,561.91
- **RMSE:** ₹ 9,128.07
- **R² Score:** 0.8962
- **Prediction Accuracy:** 80.6%

### Authoritative Business Rules
- **Required Cash:** `D × 1.2` (where `D` = predicted demand)
- **Recommended Refill:** `max(0, Required Cash − Current Balance)`
- **Risk Level:**
  - **HIGH:** If `Current Balance < Predicted Demand`
  - **MEDIUM:** If not High and `Current Balance < 1.5 × Predicted Demand`
  - **LOW:** Otherwise

---

## 4. Quick Start & Execution Commands

### Prerequisites
- Python 3.10+
- Node.js 18+ and npm

### Backend Setup & Launch
```bash
# Navigate to server
cd server

# Install Python requirements
pip install -r requirements.txt

# (Optional) Regenerate dataset, re-train model, and re-seed database
python scripts/generate_and_train.py

# Launch FastAPI server on port 8000
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```
- API Health: [http://127.0.0.1:8000/api/health](http://127.0.0.1:8000/api/health)
- Swagger Docs: [http://127.0.0.1:8000/api/docs](http://127.0.0.1:8000/api/docs)

### Frontend Setup & Launch
```bash
# Navigate to client
cd client

# Install Node dependencies
npm install

# Start Vite dev server
npm run dev

# Or run the production build
npm run build
```
- Web Application: [http://localhost:5173/](http://localhost:5173/) (or port 5174)
- **Default Credentials:**
  - Username: `admin`
  - Password: `admin123`

### Running Backend Tests
```bash
python -m pytest server/tests/test_backend.py
```

---

## 5. Security & Data Authenticity Notice
- All passwords are encrypted with salted `bcrypt`.
- Authentication uses standards-compliant `HS256` signed JWT tokens.
- No live banking secrets or raw database credentials are exposed to the client.
- The 128 ATMs represent major Indian metro hubs (Delhi, Mumbai, Bengaluru, Hyderabad, Noida, Chennai, Pune, Kolkata) populated with realistic historical transaction records for academic decision-support prototyping.
