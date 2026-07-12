export interface Note {
  id: string;
  user_id: string;
  lead_id: string;
  content: string;
  is_pinned: boolean;
  attachments: string[];
  created_at: string;
  updated_at: string;
}
