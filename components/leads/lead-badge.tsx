import { cn, getStatusColor, getPriorityColor, getPlatformColor } from "@/lib/utils";
import type { LeadStatus, LeadPriority, LeadPlatform } from "@/types";

const STATUS_LABELS: Record<LeadStatus, string> = {
  new: "New",
  initiated: "Initiated",
  message_sent: "Sent",
  viewed: "Viewed",
  responded: "Responded",
  interested: "Interested",
  meeting_scheduled: "Meeting",
  proposal_sent: "Proposal",
  negotiation: "Negotiating",
  waiting: "Waiting",
  won: "Won",
  lost: "Lost",
  ghosted: "Ghosted",
  rejected: "Rejected",
  archived: "Archived",
};

const PRIORITY_LABELS: Record<LeadPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
  urgent: "Urgent",
};

export function StatusBadge({ status }: { status: LeadStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        getStatusColor(status)
      )}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium",
        getPriorityColor(priority)
      )}
    >
      {PRIORITY_LABELS[priority]}
    </span>
  );
}

export function PlatformBadge({ platform }: { platform: LeadPlatform }) {
  const color = getPlatformColor(platform);
  const PLATFORM_LABELS: Record<LeadPlatform, string> = {
    linkedin: "LinkedIn",
    twitter: "Twitter",
    instagram: "Instagram",
    github: "GitHub",
    website: "Website",
    referral: "Referral",
    email: "Email",
    other: "Other",
  };

  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium"
      style={{ color, backgroundColor: `${color}18` }}
    >
      {PLATFORM_LABELS[platform]}
    </span>
  );
}
