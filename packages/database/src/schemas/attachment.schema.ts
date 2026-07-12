export interface Attachment {
  id: string;
  user_id: string;
  lead_id?: string | null;
  email_id?: string | null;
  name: string;
  url: string;
  size: number;
  mime_type: string;
  created_at: string;
}
