export interface Plan {
  id: number;
  name: string;
  code: string;
  description?: string;
  monthly_price: number;
  max_users: number;
  max_clients: number;
  support_level: string;
  trial_days: number;
  status: string;
}

export interface Subscription {
  id: number;
  tenant_id: number;
  plan_id: number;
  status: string;
  started_at: string;
  trial_ends_at?: string;
  renews_at?: string;
  canceled_at?: string;
  tenant_name?: string;
  plan_name?: string;
}

export interface TenantUsage {
  tenant_id: number;
  users: { used: number; limit: number | null };
  clients: { used: number; limit: number | null };
  subscription_status?: string;
  plan_code?: string;
}
