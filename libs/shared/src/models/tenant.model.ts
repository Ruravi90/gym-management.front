export interface Tenant {
  id: number;
  name: string;
  slug: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  status: string;
  max_users: number;
  created_at: string;
  updated_at: string;
  waha_session?: string;
  waha_enabled?: boolean;
}

export interface TenantCreate {
  name: string;
  slug?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  max_users?: number;
  waha_session?: string;
  waha_enabled?: boolean;
}

export interface TenantUpdate {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  logo_url?: string;
  status?: string;
  max_users?: number;
  waha_session?: string;
  waha_enabled?: boolean;
}

export interface WahaStatus { configured: boolean; active: boolean; session?: string; base_url?: string; }

export interface TenantStats {
  tenant_id: number;
  tenant_name: string;
  total_users: number;
  total_clients: number;
  active_memberships: number;
  total_revenue: number;
}
