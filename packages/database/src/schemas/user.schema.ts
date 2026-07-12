export interface User {
  id: string;
  name: string;
  email: string;
  email_verified: boolean;
  image?: string | null;
  created_at: string;
  updated_at: string;
}
