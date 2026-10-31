export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface User {
  user_id: string;
  username: string;
  name: string;
  email: string;
  role: string;
}

export interface ATM {
  atm_id: string;
  atm_name: string;
  city: string;
  atm_address?: string;
  current_balance: number;
  predicted_demand?: number;
  recommended_refill?: number;
  risk_level: RiskLevel;
  status: string;
  latitude?: number;
  longitude?: number;
  last_prediction_time?: string;
}

export interface ATMDetail extends ATM {
  safety_factor: number;
  avg_daily_withdrawal: number;
  peak_day: string;
  volatility: string;
  suggested_action: string;
}

export interface Transaction {
  transaction_id: number;
  atm_id: string;
  transaction_type: string;
  amount: number;
  balance_after?: number;
  outcome_count?: number;
  total_transaction_count?: number;
  transaction_time: string;
}

export interface FeatureRecord {
  id: number;
  atm_id: string;
  timestamp: string;
  hour: number;
  day_of_week: number;
  is_weekend: number;
  is_holiday: number;
  totalBalance: number;
  numberOutcomeTransaction: number;
  totalNumberTransaction: number;
  previous_demand: number;
  previous_transaction_count: number;
  rolling_mean_3: number;
  target_demand: number;
}

export interface Prediction {
  prediction_id: string;
  atm_id: string;
  atm_name?: string;
  city?: string;
  predicted_demand: number;
  current_balance: number;
  risk_level: RiskLevel;
  recommended_refill: number;
  prediction_period: string;
  model_version: string;
  prediction_time: string;
  review_status: string;
  feature_snapshot?: Record<string, any>;
}

export interface RefillRecommendation {
  prediction_id: string;
  atm_id: string;
  atm_name?: string;
  city?: string;
  current_balance: number;
  predicted_demand: number;
  recommended_refill: number;
  risk_level: RiskLevel;
  priority: string;
  review_status: string;
  reviewed_by?: string;
  reviewed_at?: string;
  prediction_time: string;
}

export interface OverviewKPIs {
  total_atms: number;
  high_risk: number;
  high_risk_pct: number;
  medium_risk: number;
  medium_risk_pct: number;
  low_risk: number;
  low_risk_pct: number;
  network_balance: number;
  forecast_demand: number;
  recommended_refill: number;
  prediction_count: number;
}

export interface TrendPoint {
  date: string;
  actual_demand: number;
  predicted_demand: number;
}

export interface RiskDistribution {
  high_risk: number;
  medium_risk: number;
  low_risk: number;
  total: number;
}

export interface AttentionItem {
  atm_id: string;
  location: string;
  current_balance: number;
  predicted_demand: number;
  risk: RiskLevel;
  recommended_refill: number;
}

export interface OverviewData {
  kpis: OverviewKPIs;
  trend: TrendPoint[];
  risk_distribution: RiskDistribution;
  attention_list: AttentionItem[];
  recent_predictions: Prediction[];
}

export interface ModelMetrics {
  mae: number;
  rmse: number;
  r2_score: number;
  accuracy_pct: number;
  evaluation_date: string;
  model_type: string;
}

export interface TopAtmDemand {
  atm_id: string;
  name: string;
  city: string;
  demand: number;
}

export interface DayRiskDistribution {
  date: string;
  high: number;
  medium: number;
  low: number;
}

export interface AnalyticsData {
  metrics: ModelMetrics;
  trend: TrendPoint[];
  risk_over_time: DayRiskDistribution[];
  top_atms: TopAtmDemand[];
  risk_distribution: RiskDistribution;
}

export interface SystemStatus {
  api_server: string;
  database: string;
  ml_model: string;
  features_count: number;
  feature_names: string[];
  last_model_update: string;
  db_type: string;
  version: string;
}
