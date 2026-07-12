export { supabase } from "./client";
export { TABLES } from "./tables";
export type {
  Database,
  Json,
  TableName,
  TableRow,
  TableInsert,
  TableUpdate,
} from "./database.types";
export type { Activity, ActivityType } from "./schemas/activity.schema";
export type { Attachment } from "./schemas/attachment.schema";
export type { Email, EmailEvent, EmailStatus, EmailEventType } from "./schemas/email.schema";
export type { FollowUp, FollowUpStatus, RecurringUnit } from "./schemas/followup.schema";
export type { Lead, LeadStatus, LeadPriority, LeadPlatform, LeadResponse, ProjectType } from "./schemas/lead.schema";
export type { Meeting, MeetingType } from "./schemas/meeting.schema";
export type { Note } from "./schemas/note.schema";
export type { Notification, NotificationType } from "./schemas/notification.schema";
export type { Settings, Theme } from "./schemas/settings.schema";
export type { Tag } from "./schemas/tag.schema";
export type { Template, TemplateType } from "./schemas/template.schema";
export type { User } from "./schemas/user.schema";
