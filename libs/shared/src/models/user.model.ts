export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: string;
  status: boolean;
  created_at: string;
  profile_image?: string;
}
