import { z } from "zod";

export const createLeadSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  company: z.string().max(100).optional(),
  designation: z.string().max(100).optional(),
  industry: z.string().max(100).optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().max(20).optional(),
  whatsapp: z.string().max(20).optional(),
  website: z.string().url("Invalid URL").optional().or(z.literal("")),
  linkedin: z.string().url("Invalid URL").optional().or(z.literal("")),
  twitter: z.string().url("Invalid URL").optional().or(z.literal("")),
  instagram: z.string().url("Invalid URL").optional().or(z.literal("")),
  github: z.string().url("Invalid URL").optional().or(z.literal("")),
  portfolio: z.string().url("Invalid URL").optional().or(z.literal("")),
  location: z.string().max(100).optional(),
  bio: z.string().max(1000).optional(),
  tags: z.array(z.string()).default([]),
  priority: z.enum(["low", "medium", "high", "urgent"]).default("medium"),
  status: z.enum([
    "new", "initiated", "message_sent", "viewed", "responded",
    "interested", "meeting_scheduled", "proposal_sent", "negotiation",
    "waiting", "won", "lost", "ghosted", "rejected", "archived",
  ]).default("new"),
  platform: z.enum(["linkedin", "twitter", "instagram", "github", "website", "referral", "email", "other"]),
  response: z.enum(["positive", "negative", "neutral", "none"]).default("none"),
  budget: z.number().min(0).optional(),
  expectedRevenue: z.number().min(0).optional(),
  projectType: z.enum([
    "web_development", "mobile_app", "design", "consulting",
    "maintenance", "seo", "marketing", "other",
  ]).optional(),
  nextFollowUp: z.string().optional(),
});

export const updateLeadSchema = createLeadSchema.partial();

export const createFollowUpSchema = z.object({
  leadId: z.string().min(1),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  dueDate: z.string().min(1, "Due date is required"),
  isRecurring: z.boolean().default(false),
  recurringInterval: z.number().min(1).optional(),
  recurringUnit: z.enum(["days", "weeks", "months"]).optional(),
});

export const createMeetingSchema = z.object({
  leadId: z.string().min(1),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(1000).optional(),
  type: z.enum(["call", "video", "in_person", "other"]).default("video"),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  location: z.string().max(200).optional(),
  meetingUrl: z.string().url("Invalid URL").optional().or(z.literal("")),
  notes: z.string().max(2000).optional(),
});

export const createNoteSchema = z.object({
  leadId: z.string().min(1),
  content: z.string().min(1, "Content is required"),
  isPinned: z.boolean().default(false),
});

export const createTemplateSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  subject: z.string().min(1, "Subject is required").max(200),
  body: z.string().min(1, "Body is required"),
  type: z.enum(["introduction", "follow_up", "reminder", "proposal", "meeting_confirmation", "thank_you", "custom"]),
  variables: z.array(z.string()).default([]),
  isDefault: z.boolean().default(false),
});

export const sendEmailSchema = z.object({
  leadId: z.string().min(1),
  to: z.string().email("Invalid email"),
  subject: z.string().min(1, "Subject is required"),
  body: z.string().min(1, "Body is required"),
  templateId: z.string().optional(),
});

export const signInSchema = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type CreateFollowUpInput = z.infer<typeof createFollowUpSchema>;
export type CreateMeetingInput = z.infer<typeof createMeetingSchema>;
export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type CreateTemplateInput = z.infer<typeof createTemplateSchema>;
export type SendEmailInput = z.infer<typeof sendEmailSchema>;
export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
