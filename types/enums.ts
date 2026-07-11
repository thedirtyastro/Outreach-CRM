export type LeadStatus =
  | "new"
  | "initiated"
  | "message_sent"
  | "viewed"
  | "responded"
  | "interested"
  | "meeting_scheduled"
  | "proposal_sent"
  | "negotiation"
  | "waiting"
  | "won"
  | "lost"
  | "ghosted"
  | "rejected"
  | "archived";

export type LeadPriority = "low" | "medium" | "high" | "urgent";

export type LeadPlatform =
  | "linkedin"
  | "twitter"
  | "instagram"
  | "github"
  | "website"
  | "referral"
  | "email"
  | "other";

export type LeadResponse = "positive" | "negative" | "neutral" | "none";

export type ActivityType =
  | "lead_created"
  | "lead_updated"
  | "email_sent"
  | "email_opened"
  | "email_clicked"
  | "meeting_added"
  | "call_logged"
  | "note_added"
  | "proposal_uploaded"
  | "project_won"
  | "project_lost"
  | "status_changed"
  | "follow_up_created"
  | "follow_up_completed"
  | "attachment_added";

export type EmailEventType =
  | "delivered"
  | "opened"
  | "clicked"
  | "bounced"
  | "complained"
  | "replied";

export type FollowUpStatus =
  | "pending"
  | "completed"
  | "overdue"
  | "cancelled";

export type MeetingType = "call" | "video" | "in_person" | "other";

export type ProjectType =
  | "web_development"
  | "mobile_app"
  | "design"
  | "consulting"
  | "maintenance"
  | "seo"
  | "marketing"
  | "other";

export type TemplateType =
  | "introduction"
  | "follow_up"
  | "reminder"
  | "proposal"
  | "meeting_confirmation"
  | "thank_you"
  | "custom";
