/**
 * Supabase Database type definitions.
 * Row types mirror packages/database/migrations/001_initial_schema.sql
 */

import type { AcquisitionGoal } from "./schemas/acquisition-goal.schema";
import type { Activity } from "./schemas/activity.schema";
import type { Attachment } from "./schemas/attachment.schema";
import type { Email, EmailEvent } from "./schemas/email.schema";
import type { FollowUp } from "./schemas/followup.schema";
import type { Lead } from "./schemas/lead.schema";
import type { Meeting } from "./schemas/meeting.schema";
import type { Note } from "./schemas/note.schema";
import type { Notification } from "./schemas/notification.schema";
import type { OutreachLog } from "./schemas/outreach-log.schema";
import type { ProductivityStreak } from "./schemas/productivity-streak.schema";
import type { Settings } from "./schemas/settings.schema";
import type { Tag } from "./schemas/tag.schema";
import type { Template } from "./schemas/template.schema";
import type { User } from "./schemas/user.schema";

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/**
 * Helper: Remap a type to a plain object with an implicit index signature.
 * Required because @supabase/postgrest-js checks `Row extends Record<string, unknown>`.
 * TypeScript interfaces don't satisfy that check, but mapped types do.
 */
type ToRecord<T> = { [K in keyof T]: T[K] } & Record<string, unknown>;

/**
 * Helper: keys from K that actually exist in T.
 */
type ExistingKeys<T, K extends string> = Extract<keyof T, K>;

/**
 * Extract required keys from T (keys that are NOT optional via ?).
 */
type RequiredKeys<T> = { [K in keyof T]-?: undefined extends T[K] ? never : K }[keyof T];

/**
 * Extract optional keys from T.
 */
type OptionalKeysOf<T> = Exclude<keyof T, RequiredKeys<T>>;

/**
 * Auto-generated fields that should always be optional in Insert.
 */
type AutoFields = "id" | "created_at" | "updated_at";

/**
 * For inserts: Auto-generated fields + explicitly listed default fields become optional.
 * D = additional field names that have SQL defaults.
 */
type InsertRow<T, D extends string = never> =
  & { [K in Exclude<RequiredKeys<T>, ExistingKeys<T, AutoFields | D>>]: T[K] }
  & { [K in OptionalKeysOf<T> | ExistingKeys<T, AutoFields | D>]?: T[K] }
  & Record<string, unknown>;

/**
 * For updates: all fields optional EXCEPT id/created_at which are excluded.
 */
type UpdateRow<T> =
  & { [K in Exclude<keyof T, ExistingKeys<T, "id" | "created_at">>]?: T[K] }
  & Record<string, unknown>;

export interface Database {
  public: {
    Tables: {
      acquisition_goals: {
        Row: ToRecord<AcquisitionGoal>;
        Insert: InsertRow<AcquisitionGoal, "target_contacts" | "linkedin_target" | "twitter_target" | "github_target" | "instagram_target" | "email_target" | "calls_target" | "meetings_target" | "revenue_target" | "working_hours" | "schedule">;
        Update: UpdateRow<AcquisitionGoal>;
        Relationships: [];
      };
      activities: {
        Row: ToRecord<Activity>;
        Insert: InsertRow<Activity>;
        Update: UpdateRow<Activity>;
        Relationships: [
          {
            foreignKeyName: "activities_lead_id_fkey";
            columns: ["lead_id"];
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      attachments: {
        Row: ToRecord<Attachment>;
        Insert: InsertRow<Attachment>;
        Update: UpdateRow<Attachment>;
        Relationships: [
          {
            foreignKeyName: "attachments_lead_id_fkey";
            columns: ["lead_id"];
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "attachments_email_id_fkey";
            columns: ["email_id"];
            referencedRelation: "emails";
            referencedColumns: ["id"];
          },
        ];
      };
      emails: {
        Row: ToRecord<Email>;
        Insert: InsertRow<Email, "status" | "attachments">;
        Update: UpdateRow<Email>;
        Relationships: [
          {
            foreignKeyName: "emails_lead_id_fkey";
            columns: ["lead_id"];
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      email_events: {
        Row: ToRecord<EmailEvent>;
        Insert: InsertRow<EmailEvent>;
        Update: UpdateRow<EmailEvent>;
        Relationships: [
          {
            foreignKeyName: "email_events_email_id_fkey";
            columns: ["email_id"];
            referencedRelation: "emails";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "email_events_lead_id_fkey";
            columns: ["lead_id"];
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      follow_ups: {
        Row: ToRecord<FollowUp>;
        Insert: InsertRow<FollowUp, "status" | "is_recurring">;
        Update: UpdateRow<FollowUp>;
        Relationships: [
          {
            foreignKeyName: "follow_ups_lead_id_fkey";
            columns: ["lead_id"];
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      leads: {
        Row: ToRecord<Lead>;
        Insert: InsertRow<Lead, "tags" | "priority" | "status" | "response" | "is_archived">;
        Update: UpdateRow<Lead>;
        Relationships: [];
      };
      meetings: {
        Row: ToRecord<Meeting>;
        Insert: InsertRow<Meeting, "type">;
        Update: UpdateRow<Meeting>;
        Relationships: [
          {
            foreignKeyName: "meetings_lead_id_fkey";
            columns: ["lead_id"];
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      notes: {
        Row: ToRecord<Note>;
        Insert: InsertRow<Note, "is_pinned" | "attachments">;
        Update: UpdateRow<Note>;
        Relationships: [
          {
            foreignKeyName: "notes_lead_id_fkey";
            columns: ["lead_id"];
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      notifications: {
        Row: ToRecord<Notification>;
        Insert: InsertRow<Notification, "type" | "is_read">;
        Update: UpdateRow<Notification>;
        Relationships: [
          {
            foreignKeyName: "notifications_lead_id_fkey";
            columns: ["lead_id"];
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      outreach_logs: {
        Row: ToRecord<OutreachLog>;
        Insert: InsertRow<OutreachLog, "status" | "replied" | "meeting_booked" | "proposal_sent" | "client_won">;
        Update: UpdateRow<OutreachLog>;
        Relationships: [
          {
            foreignKeyName: "outreach_logs_lead_id_fkey";
            columns: ["lead_id"];
            referencedRelation: "leads";
            referencedColumns: ["id"];
          },
        ];
      };
      productivity_streaks: {
        Row: ToRecord<ProductivityStreak>;
        Insert: InsertRow<ProductivityStreak, "current_streak" | "longest_streak" | "completed_days">;
        Update: UpdateRow<ProductivityStreak>;
        Relationships: [];
      };
      settings: {
        Row: ToRecord<Settings>;
        Insert: InsertRow<Settings, "theme" | "notif_email" | "notif_desktop" | "notif_follow_up_reminder" | "notif_meeting_reminder" | "email_track_opens" | "email_track_clicks" | "timezone">;
        Update: UpdateRow<Settings>;
        Relationships: [];
      };
      tags: {
        Row: ToRecord<Tag>;
        Insert: InsertRow<Tag, "color">;
        Update: UpdateRow<Tag>;
        Relationships: [];
      };
      templates: {
        Row: ToRecord<Template>;
        Insert: InsertRow<Template, "type" | "variables" | "is_default">;
        Update: UpdateRow<Template>;
        Relationships: [];
      };
      user: {
        Row: ToRecord<User>;
        Insert: InsertRow<User>;
        Update: UpdateRow<User>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      activity_type: Activity["type"];
      email_event_type: EmailEvent["type"];
      email_status: Email["status"];
      followup_status: FollowUp["status"];
      lead_platform: Lead["platform"];
      lead_priority: Lead["priority"];
      lead_project_type: NonNullable<Lead["project_type"]>;
      lead_response: Lead["response"];
      lead_status: Lead["status"];
      meeting_type: Meeting["type"];
      notification_type: Notification["type"];
      recurring_unit: NonNullable<FollowUp["recurring_unit"]>;
      template_type: Template["type"];
      theme_type: Settings["theme"];
    };
    CompositeTypes: Record<string, never>;
  };
}

export type TableName = keyof Database["public"]["Tables"];

export type TableRow<T extends TableName> = Database["public"]["Tables"][T]["Row"];
export type TableInsert<T extends TableName> = Database["public"]["Tables"][T]["Insert"];
export type TableUpdate<T extends TableName> = Database["public"]["Tables"][T]["Update"];
