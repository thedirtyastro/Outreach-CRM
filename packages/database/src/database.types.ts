/**
 * Supabase Database type definitions.
 * Row types mirror packages/database/migrations/001_initial_schema.sql
 */

import type { Activity } from "./schemas/activity.schema";
import type { Attachment } from "./schemas/attachment.schema";
import type { Email, EmailEvent } from "./schemas/email.schema";
import type { FollowUp } from "./schemas/followup.schema";
import type { Lead } from "./schemas/lead.schema";
import type { Meeting } from "./schemas/meeting.schema";
import type { Note } from "./schemas/note.schema";
import type { Notification } from "./schemas/notification.schema";
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

type InsertRow<T> = Omit<T, "id" | "created_at" | "updated_at"> &
  Partial<Pick<T, "id" | "created_at" | "updated_at">>;

type UpdateRow<T> = Partial<Omit<T, "id" | "created_at">>;

export interface Database {
  public: {
    Tables: {
      activities: {
        Row: Activity;
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
        Row: Attachment;
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
        Row: Email;
        Insert: InsertRow<Email>;
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
        Row: EmailEvent;
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
        Row: FollowUp;
        Insert: InsertRow<FollowUp>;
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
        Row: Lead;
        Insert: InsertRow<Lead>;
        Update: UpdateRow<Lead>;
        Relationships: [];
      };
      meetings: {
        Row: Meeting;
        Insert: InsertRow<Meeting>;
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
        Row: Note;
        Insert: InsertRow<Note>;
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
        Row: Notification;
        Insert: InsertRow<Notification>;
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
      settings: {
        Row: Settings;
        Insert: InsertRow<Settings>;
        Update: UpdateRow<Settings>;
        Relationships: [];
      };
      tags: {
        Row: Tag;
        Insert: InsertRow<Tag>;
        Update: UpdateRow<Tag>;
        Relationships: [];
      };
      templates: {
        Row: Template;
        Insert: InsertRow<Template>;
        Update: UpdateRow<Template>;
        Relationships: [];
      };
      user: {
        Row: User;
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
