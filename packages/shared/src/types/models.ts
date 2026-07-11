import type {
  LeadStatus,
  LeadPriority,
  LeadPlatform,
  LeadResponse,
  ActivityType,
  EmailEventType,
  FollowUpStatus,
  MeetingType,
  ProjectType,
  TemplateType,
} from "./enums";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  image?: string;
  emailVerified?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ILead {
  _id: string;
  userId: string;
  // Basic Info
  name: string;
  company?: string;
  designation?: string;
  industry?: string;
  // Contact
  email?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  // Social
  linkedin?: string;
  twitter?: string;
  instagram?: string;
  github?: string;
  portfolio?: string;
  // Location
  location?: string;
  // Profile
  bio?: string;
  profileImage?: string;
  tags: string[];
  // Pipeline
  priority: LeadPriority;
  status: LeadStatus;
  platform: LeadPlatform;
  response: LeadResponse;
  // Financial
  budget?: number;
  expectedRevenue?: number;
  projectType?: ProjectType;
  // Dates
  lastContact?: string;
  nextFollowUp?: string;
  createdAt: string;
  updatedAt: string;
  // Score
  score?: number;
  // Archived
  isArchived: boolean;
  archivedAt?: string;
}

export interface IActivity {
  _id: string;
  userId: string;
  leadId: string;
  type: ActivityType;
  description: string;
  icon?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface IEmail {
  _id: string;
  userId: string;
  leadId: string;
  messageId?: string;
  subject: string;
  body: string;
  html?: string;
  from: string;
  to: string;
  status: "draft" | "sent" | "failed";
  threadId?: string;
  attachments?: string[];
  openedAt?: string;
  clickedAt?: string;
  repliedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IEmailEvent {
  _id: string;
  emailId: string;
  leadId: string;
  type: EmailEventType;
  data?: Record<string, unknown>;
  createdAt: string;
}

export interface IFollowUp {
  _id: string;
  userId: string;
  leadId: string;
  title: string;
  description?: string;
  dueDate: string;
  status: FollowUpStatus;
  isRecurring: boolean;
  recurringInterval?: number;
  recurringUnit?: "days" | "weeks" | "months";
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IMeeting {
  _id: string;
  userId: string;
  leadId: string;
  title: string;
  description?: string;
  type: MeetingType;
  startTime: string;
  endTime?: string;
  location?: string;
  meetingUrl?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface INote {
  _id: string;
  userId: string;
  leadId: string;
  content: string;
  isPinned: boolean;
  attachments?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface IAttachment {
  _id: string;
  userId: string;
  leadId?: string;
  emailId?: string;
  name: string;
  url: string;
  size: number;
  mimeType: string;
  createdAt: string;
}

export interface ITemplate {
  _id: string;
  userId: string;
  name: string;
  subject: string;
  body: string;
  type: TemplateType;
  variables: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface INotification {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  isRead: boolean;
  leadId?: string;
  link?: string;
  createdAt: string;
}

export interface ITag {
  _id: string;
  userId: string;
  name: string;
  color: string;
  createdAt: string;
}

export interface ISettings {
  _id: string;
  userId: string;
  theme: "dark" | "light" | "system";
  notifications: {
    email: boolean;
    desktop: boolean;
    followUpReminder: boolean;
    meetingReminder: boolean;
  };
  emailSettings: {
    signature?: string;
    defaultFrom?: string;
    trackOpens: boolean;
    trackClicks: boolean;
  };
  timezone: string;
  apiKey?: string;
  createdAt: string;
  updatedAt: string;
}
