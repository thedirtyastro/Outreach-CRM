import { z } from "zod";

// ── Goal Schema ──────────────────────────────────────────────

export const goalFormSchema = z.object({
  targetContacts: z.number().int().min(0).max(10000),
  linkedinTarget: z.number().int().min(0).max(10000),
  twitterTarget: z.number().int().min(0).max(10000),
  instagramTarget: z.number().int().min(0).max(10000),
  githubTarget: z.number().int().min(0).max(10000),
  emailTarget: z.number().int().min(0).max(10000),
  callsTarget: z.number().int().min(0).max(10000),
  meetingsTarget: z.number().int().min(0).max(10000),
  revenueGoal: z.number().min(0).max(999_999_999.99),
  workingHours: z.number().min(0).max(24),
  notes: z.string().max(2000).optional().default(""),
  schedule: z.enum(["today_only", "daily", "weekdays", "custom"]),
  customDays: z.array(z.number().int().min(0).max(6)).optional(),
}).refine(
  (data) => data.schedule !== "custom" || (data.customDays && data.customDays.length > 0),
  { message: "At least one day must be selected for custom schedule", path: ["customDays"] }
);

// ── Outreach Log Schema ──────────────────────────────────────

export const outreachLogSchema = z.object({
  leadId: z.string().uuid().optional(),
  platform: z.enum(["linkedin", "twitter", "github", "instagram", "email", "website"]),
  contactName: z.string().trim().min(1, "Contact name is required").max(255),
  company: z.string().max(255).optional(),
  outreachType: z.enum(["connection", "message", "email", "call"]),
  status: z.enum(["sent", "viewed", "replied", "interested"]),
  replied: z.boolean().optional().default(false),
  meetingBooked: z.boolean().optional().default(false),
  proposalSent: z.boolean().optional().default(false),
  clientWon: z.boolean().optional().default(false),
  revenue: z.number().min(0, "Revenue must be zero or greater").optional(),
  notes: z.string().max(2000).optional(),
});

// ── Analytics Query Schema ───────────────────────────────────

export const analyticsQuerySchema = z.object({
  range: z.enum(["7d", "30d", "90d", "this_month"]),
});

// ── Logs Query Schema ────────────────────────────────────────

export const logsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  from: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  to: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  platform: z.enum(["linkedin", "twitter", "github", "instagram", "email", "website"]).optional(),
});

// ── Inferred Types ───────────────────────────────────────────

export type GoalFormInput = z.infer<typeof goalFormSchema>;
export type OutreachLogInput = z.infer<typeof outreachLogSchema>;
export type AnalyticsQueryInput = z.infer<typeof analyticsQuerySchema>;
export type LogsQueryInput = z.infer<typeof logsQuerySchema>;
