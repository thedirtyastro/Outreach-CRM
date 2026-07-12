export type TemplateType =
  | "introduction"
  | "follow_up"
  | "reminder"
  | "proposal"
  | "meeting_confirmation"
  | "thank_you"
  | "custom";

export interface Template {
  id: string;
  user_id: string;
  name: string;
  subject: string;
  body: string;
  type: TemplateType;
  variables: string[];
  is_default: boolean;
  created_at: string;
  updated_at: string;
}
