import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isYesterday } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  if (isToday(d)) return `Today at ${format(d, "h:mm a")}`;
  if (isYesterday(d)) return `Yesterday at ${format(d, "h:mm a")}`;
  return format(d, "MMM d, yyyy");
}

export function formatRelative(date: string | Date): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatCurrency(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat("en-US", { notation: "compact" }).format(n);
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return `${text.slice(0, length)}…`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function getPlatformColor(platform: string): string {
  const colors: Record<string, string> = {
    linkedin: "#0A66C2",
    twitter: "#1DA1F2",
    instagram: "#E1306C",
    github: "#6e5494",
    website: "#10b981",
    referral: "#f59e0b",
    email: "#6366f1",
    other: "#6b7280",
  };
  return colors[platform] ?? colors.other;
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    new: "text-blue-400 bg-blue-400/10",
    initiated: "text-indigo-400 bg-indigo-400/10",
    message_sent: "text-purple-400 bg-purple-400/10",
    viewed: "text-cyan-400 bg-cyan-400/10",
    responded: "text-teal-400 bg-teal-400/10",
    interested: "text-green-400 bg-green-400/10",
    meeting_scheduled: "text-emerald-400 bg-emerald-400/10",
    proposal_sent: "text-lime-400 bg-lime-400/10",
    negotiation: "text-yellow-400 bg-yellow-400/10",
    waiting: "text-orange-400 bg-orange-400/10",
    won: "text-green-400 bg-green-400/10",
    lost: "text-red-400 bg-red-400/10",
    ghosted: "text-gray-400 bg-gray-400/10",
    rejected: "text-rose-400 bg-rose-400/10",
    archived: "text-gray-500 bg-gray-500/10",
  };
  return colors[status] ?? "text-gray-400 bg-gray-400/10";
}

export function getPriorityColor(priority: string): string {
  const colors: Record<string, string> = {
    low: "text-gray-400 bg-gray-400/10",
    medium: "text-blue-400 bg-blue-400/10",
    high: "text-orange-400 bg-orange-400/10",
    urgent: "text-red-400 bg-red-400/10",
  };
  return colors[priority] ?? "text-gray-400 bg-gray-400/10";
}

export function buildQueryString(params: Record<string, unknown>): string {
  const filtered = Object.entries(params).filter(
    ([, v]) => v !== undefined && v !== null && v !== ""
  );
  return new URLSearchParams(
    filtered.map(([k, v]) => [k, String(v)])
  ).toString();
}
