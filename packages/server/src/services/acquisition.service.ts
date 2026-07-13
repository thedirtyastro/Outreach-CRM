/**
 * server/services/acquisition.service.ts
 *
 * Core business logic for the Client Acquisition Tracker module.
 */

import { supabase } from "@outreach/database/client";
import type {
  IAcquisitionGoal,
  IOutreachLog,
  IProductivityStreak,
  AcquisitionDashboard,
  TodaysProgress,
  FunnelStage,
  WeeklyAnalytics,
  MonthlyPerformance,
  PlatformProgress,
  StreakData,
  Badge,
  DailyActivity,
  ForecastData,
  Insight,
  PaginatedResponse,
  GoalSchedule,
  OutreachPlatform,
} from "@outreach/shared";
import type { GoalFormInput, OutreachLogInput } from "@outreach/shared";

// ── Helpers ──────────────────────────────────────────────────

function formatDate(d: Date): string {
  return d.toISOString().split("T")[0];
}

function startOfWeek(d: Date): Date {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  return new Date(d.getFullYear(), d.getMonth(), diff);
}

function startOfMonth(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function subDays(d: Date, n: number): Date {
  const result = new Date(d);
  result.setDate(result.getDate() - n);
  return result;
}

function getDaysInMonth(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
}

function differenceInDays(a: Date, b: Date): number {
  const ms = a.getTime() - b.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function rowToGoal(r: any): IAcquisitionGoal {
  return {
    id: r.id,
    userId: r.user_id,
    date: r.date,
    targetContacts: r.target_contacts,
    linkedinTarget: r.linkedin_target,
    twitterTarget: r.twitter_target,
    githubTarget: r.github_target,
    instagramTarget: r.instagram_target,
    emailTarget: r.email_target,
    callsTarget: r.calls_target,
    meetingsTarget: r.meetings_target,
    revenueTarget: Number(r.revenue_target),
    workingHours: Number(r.working_hours),
    notes: r.notes ?? undefined,
    schedule: r.schedule as GoalSchedule,
    customDays: r.custom_days ?? undefined,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

function rowToLog(r: any): IOutreachLog {
  return {
    id: r.id,
    userId: r.user_id,
    leadId: r.lead_id ?? undefined,
    platform: r.platform,
    contactName: r.contact_name,
    company: r.company ?? undefined,
    outreachType: r.outreach_type,
    status: r.status,
    replied: r.replied,
    meetingBooked: r.meeting_booked,
    proposalSent: r.proposal_sent,
    clientWon: r.client_won,
    revenue: r.revenue != null ? Number(r.revenue) : undefined,
    notes: r.notes ?? undefined,
    createdAt: r.created_at,
  };
}

function rowToStreak(r: any): IProductivityStreak {
  return {
    id: r.id,
    userId: r.user_id,
    currentStreak: r.current_streak,
    longestStreak: r.longest_streak,
    completedDays: r.completed_days,
    lastCompleted: r.last_completed,
    createdAt: r.created_at,
    updatedAt: r.updated_at,
  };
}

const PLATFORM_COLORS: Record<string, string> = {
  linkedin: "#0A66C2",
  twitter: "#000000",
  github: "#6e7681",
  instagram: "#E4405F",
  email: "#EA4335",
  website: "#14B8A6",
};

// ── Goal Operations ──────────────────────────────────────────

export async function getGoalForDate(
  userId: string,
  date: string
): Promise<IAcquisitionGoal | null> {
  const { data, error } = await supabase
    .from("acquisition_goals")
    .select("*")
    .eq("user_id", userId)
    .eq("date", date)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data ? rowToGoal(data) : null;
}

export async function upsertGoal(
  userId: string,
  data: GoalFormInput
): Promise<IAcquisitionGoal> {
  const today = formatDate(new Date());

  const row = {
    user_id: userId,
    date: today,
    target_contacts: data.targetContacts,
    linkedin_target: data.linkedinTarget,
    twitter_target: data.twitterTarget,
    github_target: data.githubTarget,
    instagram_target: data.instagramTarget,
    email_target: data.emailTarget,
    calls_target: data.callsTarget,
    meetings_target: data.meetingsTarget,
    revenue_target: data.revenueGoal,
    working_hours: data.workingHours,
    notes: data.notes || null,
    schedule: data.schedule,
    custom_days: data.customDays ?? null,
    updated_at: new Date().toISOString(),
  };

  const { data: result, error } = await supabase
    .from("acquisition_goals")
    .upsert(row, { onConflict: "user_id,date" })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToGoal(result);
}

// ── Outreach Log Operations ──────────────────────────────────

export async function createOutreachLog(
  userId: string,
  data: OutreachLogInput
): Promise<IOutreachLog> {
  // Validate lead_id if provided
  if (data.leadId) {
    const { data: lead } = await supabase
      .from("leads")
      .select("id")
      .eq("id", data.leadId)
      .eq("user_id", userId)
      .maybeSingle();
    if (!lead) throw new Error("Lead not found");
  }

  const { data: log, error } = await supabase
    .from("outreach_logs")
    .insert({
      user_id: userId,
      lead_id: data.leadId ?? null,
      platform: data.platform,
      contact_name: data.contactName,
      company: data.company ?? null,
      outreach_type: data.outreachType,
      status: data.status,
      replied: data.replied ?? false,
      meeting_booked: data.meetingBooked ?? false,
      proposal_sent: data.proposalSent ?? false,
      client_won: data.clientWon ?? false,
      revenue: data.revenue ?? null,
      notes: data.notes ?? null,
    })
    .select()
    .single();

  if (error) throw new Error(error.message);

  // Update streak after successful log creation
  await updateStreak(userId, formatDate(new Date()));

  return rowToLog(log);
}

export interface ListLogsOptions {
  userId: string;
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
  platform?: string;
}

export async function listOutreachLogs(
  options: ListLogsOptions
): Promise<PaginatedResponse<IOutreachLog>> {
  const { userId, page = 1, limit = 20, from, to, platform } = options;
  const safePage = Math.max(1, page);
  const safeLimit = Math.min(100, Math.max(1, limit));
  const offset = (safePage - 1) * safeLimit;

  let query = supabase
    .from("outreach_logs")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + safeLimit - 1);

  if (from) query = query.gte("created_at", `${from}T00:00:00.000Z`);
  if (to) query = query.lte("created_at", `${to}T23:59:59.999Z`);
  if (platform) query = query.eq("platform", platform as OutreachPlatform);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  const total = count ?? 0;
  return {
    data: (data ?? []).map(rowToLog),
    total,
    page: safePage,
    limit: safeLimit,
    totalPages: Math.ceil(total / safeLimit),
  };
}

export async function updateOutreachLog(
  id: string,
  userId: string,
  updates: Partial<OutreachLogInput>
): Promise<IOutreachLog | null> {
  const dbUpdates: Record<string, unknown> = {};
  if (updates.platform !== undefined) dbUpdates.platform = updates.platform;
  if (updates.contactName !== undefined) dbUpdates.contact_name = updates.contactName;
  if (updates.company !== undefined) dbUpdates.company = updates.company;
  if (updates.outreachType !== undefined) dbUpdates.outreach_type = updates.outreachType;
  if (updates.status !== undefined) dbUpdates.status = updates.status;
  if (updates.replied !== undefined) dbUpdates.replied = updates.replied;
  if (updates.meetingBooked !== undefined) dbUpdates.meeting_booked = updates.meetingBooked;
  if (updates.proposalSent !== undefined) dbUpdates.proposal_sent = updates.proposalSent;
  if (updates.clientWon !== undefined) dbUpdates.client_won = updates.clientWon;
  if (updates.revenue !== undefined) dbUpdates.revenue = updates.revenue;
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

  const { data, error } = await supabase
    .from("outreach_logs")
    .update(dbUpdates)
    .eq("id", id)
    .eq("user_id", userId)
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data ? rowToLog(data) : null;
}

export async function deleteOutreachLog(
  id: string,
  userId: string
): Promise<boolean> {
  const { error, count } = await supabase
    .from("outreach_logs")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("user_id", userId);

  if (error) throw new Error(error.message);
  return (count ?? 0) > 0;
}

// ── Streak Operations ────────────────────────────────────────

async function getOrCreateStreak(userId: string): Promise<IProductivityStreak> {
  const { data } = await supabase
    .from("productivity_streaks")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (data) return rowToStreak(data);

  const { data: created, error } = await supabase
    .from("productivity_streaks")
    .insert({ user_id: userId })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return rowToStreak(created);
}

async function updateStreak(userId: string, date: string): Promise<void> {
  const streak = await getOrCreateStreak(userId);

  // If already completed today, skip
  if (streak.lastCompleted === date) return;

  // Check if goal is met
  const goal = await getGoalForDate(userId, date);
  const { count } = await supabase
    .from("outreach_logs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", userId)
    .gte("created_at", `${date}T00:00:00.000Z`)
    .lte("created_at", `${date}T23:59:59.999Z`);

  const logCount = count ?? 0;
  const goalMet = goal ? logCount >= goal.targetContacts : logCount > 0;

  if (!goalMet) return;

  // Determine if consecutive
  const yesterday = formatDate(subDays(new Date(date + "T12:00:00Z"), 1));
  const isConsecutive = streak.lastCompleted === yesterday;

  const newCurrentStreak = isConsecutive ? streak.currentStreak + 1 : 1;
  const newLongestStreak = Math.max(streak.longestStreak, newCurrentStreak);

  await supabase
    .from("productivity_streaks")
    .update({
      current_streak: newCurrentStreak,
      longest_streak: newLongestStreak,
      completed_days: streak.completedDays + 1,
      last_completed: date,
    })
    .eq("user_id", userId);
}

export async function getStreakData(userId: string): Promise<StreakData> {
  const streak = await getOrCreateStreak(userId);
  const today = formatDate(new Date());
  const yesterday = formatDate(subDays(new Date(), 1));

  // Reset streak if broken
  let currentStreak = streak.currentStreak;
  if (streak.lastCompleted !== today && streak.lastCompleted !== yesterday) {
    currentStreak = 0;
  }

  const badges = computeBadges(streak.longestStreak);

  return {
    currentStreak,
    longestStreak: streak.longestStreak,
    completedDays: streak.completedDays,
    lastCompleted: streak.lastCompleted,
    badges,
  };
}

function computeBadges(longestStreak: number): Badge[] {
  const milestones = [
    { days: 7, id: "7-day", name: "7 Day Streak", desc: "7 consecutive days of goal completion", icon: "🔥" },
    { days: 30, id: "30-day", name: "30 Day Streak", desc: "30 consecutive days of goal completion", icon: "⚡" },
    { days: 100, id: "100-day", name: "100 Day Streak", desc: "100 consecutive days of goal completion", icon: "🏆" },
  ];

  return milestones.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.desc,
    earned: longestStreak >= m.days,
    icon: m.icon,
  }));
}

// ── Dashboard Aggregation ────────────────────────────────────

export async function getDashboardMetrics(
  userId: string
): Promise<AcquisitionDashboard> {
  const today = formatDate(new Date());
  const weekStart = formatDate(startOfWeek(new Date()));
  const monthStart = formatDate(startOfMonth(new Date()));
  const yearStart = formatDate(subDays(new Date(), 364));

  // Parallel data fetching
  const [goal, todayLogs, weekLogs, monthLogs, streak, yearLogs] = await Promise.all([
    getGoalForDate(userId, today),
    fetchLogs(userId, today, today),
    fetchLogs(userId, weekStart, today),
    fetchLogs(userId, monthStart, today),
    getStreakData(userId),
    fetchLogs(userId, yearStart, today),
  ]);

  // Recent logs for activity timeline
  const recentLogs = todayLogs.slice(0, 10);

  return {
    todaysProgress: computeTodaysProgress(goal, todayLogs),
    funnel: computeFunnel(monthLogs),
    weeklyAnalytics: computeWeeklyAnalytics(weekLogs, weekStart, today),
    monthlyPerformance: computeMonthlyPerformance(monthLogs),
    platformProgress: computePlatformProgress(goal, todayLogs),
    streak,
    heatmap: buildHeatmap(yearLogs),
    insights: generateInsights(monthLogs, streak, goal),
    forecast: computeForecast(monthLogs),
    recentLogs,
  };
}

async function fetchLogs(userId: string, from: string, to: string): Promise<IOutreachLog[]> {
  const { data, error } = await supabase
    .from("outreach_logs")
    .select("*")
    .eq("user_id", userId)
    .gte("created_at", `${from}T00:00:00.000Z`)
    .lte("created_at", `${to}T23:59:59.999Z`)
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return (data ?? []).map(rowToLog);
}

// ── Computation Functions ────────────────────────────────────

function computeTodaysProgress(
  goal: IAcquisitionGoal | null,
  todayLogs: IOutreachLog[]
): TodaysProgress {
  const dailyTarget = goal?.targetContacts ?? 0;
  const contactsReached = todayLogs.length;
  const repliesReceived = todayLogs.filter((l) => l.replied).length;
  const meetingsBooked = todayLogs.filter((l) => l.meetingBooked).length;
  const clientsWon = todayLogs.filter((l) => l.clientWon).length;
  const revenueGenerated = todayLogs
    .filter((l) => l.clientWon && l.revenue)
    .reduce((sum, l) => sum + (l.revenue ?? 0), 0);
  const completionPercent = dailyTarget > 0
    ? Math.min(100, Math.round((contactsReached / dailyTarget) * 100))
    : 0;

  return {
    dailyTarget,
    contactsReached,
    repliesReceived,
    meetingsBooked,
    clientsWon,
    revenueGenerated,
    completionPercent,
  };
}

export function computeFunnel(logs: IOutreachLog[]): FunnelStage[] {
  const sent = logs.length;
  const seen = logs.filter((l) =>
    l.status === "viewed" || l.status === "replied" || l.status === "interested"
  ).length;
  const replied = logs.filter((l) => l.replied).length;
  const meetings = logs.filter((l) => l.meetingBooked).length;
  const proposals = logs.filter((l) => l.proposalSent).length;
  const clients = logs.filter((l) => l.clientWon).length;

  const stages = [
    { name: "Messages Sent", count: sent },
    { name: "Seen", count: seen },
    { name: "Replies", count: replied },
    { name: "Meetings", count: meetings },
    { name: "Proposals", count: proposals },
    { name: "Clients", count: clients },
  ];

  return stages.map((stage, i) => {
    if (i === 0) {
      return { ...stage, conversionRate: 100, dropOffPercent: 0 };
    }
    const prevCount = stages[i - 1].count;
    const conversionRate = prevCount > 0
      ? Math.round((stage.count / prevCount) * 1000) / 10
      : 0;
    const dropOffPercent = prevCount > 0
      ? Math.round(((prevCount - stage.count) / prevCount) * 1000) / 10
      : 0;
    return { ...stage, conversionRate, dropOffPercent };
  });
}

function computeWeeklyAnalytics(
  weekLogs: IOutreachLog[],
  weekStart: string,
  today: string
): WeeklyAnalytics {
  const days = generateDateRange(weekStart, today);

  const outreachPerDay = days.map((date) => ({
    date,
    count: weekLogs.filter((l) => l.createdAt.startsWith(date)).length,
  }));
  const repliesPerDay = days.map((date) => ({
    date,
    count: weekLogs.filter((l) => l.createdAt.startsWith(date) && l.replied).length,
  }));
  const meetingsPerDay = days.map((date) => ({
    date,
    count: weekLogs.filter((l) => l.createdAt.startsWith(date) && l.meetingBooked).length,
  }));
  const clientsPerDay = days.map((date) => ({
    date,
    count: weekLogs.filter((l) => l.createdAt.startsWith(date) && l.clientWon).length,
  }));
  const revenuePerDay = days.map((date) => ({
    date,
    amount: weekLogs
      .filter((l) => l.createdAt.startsWith(date) && l.clientWon && l.revenue)
      .reduce((sum, l) => sum + (l.revenue ?? 0), 0),
  }));

  return { outreachPerDay, repliesPerDay, meetingsPerDay, clientsPerDay, revenuePerDay, avgResponseTime: 0 };
}

function computeMonthlyPerformance(monthLogs: IOutreachLog[]): MonthlyPerformance {
  const totalContacts = monthLogs.length;
  const totalReplies = monthLogs.filter((l) => l.replied).length;
  const totalMeetings = monthLogs.filter((l) => l.meetingBooked).length;
  const totalProposals = monthLogs.filter((l) => l.proposalSent).length;
  const totalClients = monthLogs.filter((l) => l.clientWon).length;
  const revenue = monthLogs
    .filter((l) => l.clientWon && l.revenue)
    .reduce((sum, l) => sum + (l.revenue ?? 0), 0);

  return {
    totalContacts,
    totalReplies,
    replyRate: totalContacts > 0 ? Math.round((totalReplies / totalContacts) * 100) : 0,
    meetingRate: totalContacts > 0 ? Math.round((totalMeetings / totalContacts) * 100) : 0,
    proposalRate: totalContacts > 0 ? Math.round((totalProposals / totalContacts) * 100) : 0,
    winRate: totalContacts > 0 ? Math.round((totalClients / totalContacts) * 100) : 0,
    revenue,
    avgDealValue: totalClients > 0 ? Math.round((revenue / totalClients) * 100) / 100 : 0,
  };
}

function computePlatformProgress(
  goal: IAcquisitionGoal | null,
  todayLogs: IOutreachLog[]
): PlatformProgress[] {
  if (!goal) return [];

  const platforms: { key: string; target: number }[] = [
    { key: "linkedin", target: goal.linkedinTarget },
    { key: "twitter", target: goal.twitterTarget },
    { key: "github", target: goal.githubTarget },
    { key: "instagram", target: goal.instagramTarget },
    { key: "email", target: goal.emailTarget },
    { key: "website", target: 0 },
  ];

  return platforms
    .filter((p) => p.target > 0)
    .map((p) => {
      const current = todayLogs.filter((l) => l.platform === p.key).length;
      return {
        platform: p.key,
        current,
        target: p.target,
        percent: Math.round((current / p.target) * 100),
        color: PLATFORM_COLORS[p.key] ?? "#6e7681",
      };
    });
}

function buildHeatmap(yearLogs: IOutreachLog[]): DailyActivity[] {
  const result: DailyActivity[] = [];
  const today = new Date();

  for (let i = 364; i >= 0; i--) {
    const date = formatDate(subDays(today, i));
    const dayLogs = yearLogs.filter((l) => l.createdAt.startsWith(date));
    result.push({
      date,
      count: dayLogs.length,
      goalMet: dayLogs.length > 0, // simplified; ideally check against that day's goal
    });
  }

  return result;
}

export function computeForecast(monthLogs: IOutreachLog[]): ForecastData {
  const now = new Date();
  const daysElapsed = differenceInDays(now, startOfMonth(now)) + 1;
  const daysInMonth = getDaysInMonth(now);
  const remainingDays = daysInMonth - daysElapsed;

  const totalSent = monthLogs.length;
  const totalClients = monthLogs.filter((l) => l.clientWon).length;

  if (totalSent === 0) {
    return {
      projectedMonthlyClients: 0,
      projectedMonthlyRevenue: 0,
      currentConversionRate: 0,
      requiredDailyOutreach: 0,
      confidence: daysElapsed < 7 ? "low" : daysElapsed < 14 ? "medium" : "high",
      historicalBasis: daysElapsed,
    };
  }

  const conversionRate = totalClients / totalSent;
  const totalRevenue = monthLogs
    .filter((l) => l.clientWon && l.revenue)
    .reduce((sum, l) => sum + (l.revenue ?? 0), 0);
  const avgRevenuePerClient = totalClients > 0 ? totalRevenue / totalClients : 0;

  const avgDailyOutreach = totalSent / daysElapsed;
  const projectedTotalOutreach = totalSent + avgDailyOutreach * remainingDays;
  let projectedMonthlyClients = Math.round(projectedTotalOutreach * conversionRate);

  // Non-regression: never project fewer than actual
  if (projectedMonthlyClients < totalClients) {
    projectedMonthlyClients = totalClients;
  }

  const projectedMonthlyRevenue = Math.round(projectedMonthlyClients * avgRevenuePerClient);
  const requiredDailyOutreach = remainingDays > 0
    ? Math.ceil(avgDailyOutreach)
    : 0;

  const confidence: "low" | "medium" | "high" =
    daysElapsed < 7 ? "low" : daysElapsed < 14 ? "medium" : "high";

  return {
    projectedMonthlyClients,
    projectedMonthlyRevenue,
    currentConversionRate: Math.round(conversionRate * 1000) / 10,
    requiredDailyOutreach,
    confidence,
    historicalBasis: daysElapsed,
  };
}

function generateInsights(
  monthLogs: IOutreachLog[],
  streak: StreakData,
  goal: IAcquisitionGoal | null
): Insight[] {
  const insights: Insight[] = [];

  // Best platform by reply rate (min 5 attempts)
  const platformGroups: Record<string, { total: number; replies: number }> = {};
  for (const log of monthLogs) {
    if (!platformGroups[log.platform]) {
      platformGroups[log.platform] = { total: 0, replies: 0 };
    }
    platformGroups[log.platform].total++;
    if (log.replied) platformGroups[log.platform].replies++;
  }

  const qualified = Object.entries(platformGroups)
    .filter(([, v]) => v.total >= 5)
    .map(([platform, v]) => ({ platform, replyRate: v.replies / v.total }))
    .sort((a, b) => b.replyRate - a.replyRate);

  if (qualified.length > 0 && qualified[0].replyRate > 0) {
    insights.push({
      id: "best-platform",
      type: "tip",
      title: `${qualified[0].platform.charAt(0).toUpperCase() + qualified[0].platform.slice(1)} has your best reply rate`,
      description: `${Math.round(qualified[0].replyRate * 100)}% reply rate. Consider increasing outreach here.`,
      metric: "replyRate",
      value: Math.round(qualified[0].replyRate * 100),
    });
  }

  // Streak achievement
  if (streak.currentStreak >= 7) {
    insights.push({
      id: "streak-achievement",
      type: "achievement",
      title: `${streak.currentStreak}-day streak!`,
      description: "You've maintained consistent outreach. Keep it up!",
      metric: "streak",
      value: streak.currentStreak,
    });
  }

  // Goal warning
  if (goal && goal.targetContacts > 0) {
    const todayLogs = monthLogs.filter((l) =>
      l.createdAt.startsWith(formatDate(new Date()))
    );
    const progress = todayLogs.length / goal.targetContacts;
    const hoursLeft = 24 - new Date().getHours();

    if (progress < 0.5 && hoursLeft < 8) {
      insights.push({
        id: "goal-warning",
        type: "warning",
        title: "Behind on today's goal",
        description: `Only ${Math.round(progress * 100)}% complete with ${hoursLeft}h left. You need ${goal.targetContacts - todayLogs.length} more contacts.`,
        metric: "completion",
        value: Math.round(progress * 100),
      });
    }
  }

  // Best outreach time (min 5 data points)
  const hourCounts = new Map<number, { total: number; replies: number }>();
  for (const log of monthLogs) {
    const hour = new Date(log.createdAt).getHours();
    const current = hourCounts.get(hour) ?? { total: 0, replies: 0 };
    current.total++;
    if (log.replied) current.replies++;
    hourCounts.set(hour, current);
  }

  const bestHour = [...hourCounts.entries()]
    .filter(([, v]) => v.total >= 5)
    .sort((a, b) => (b[1].replies / b[1].total) - (a[1].replies / a[1].total))[0];

  if (bestHour && bestHour[1].replies > 0) {
    insights.push({
      id: "best-time",
      type: "suggestion",
      title: `Best outreach time: ${bestHour[0]}:00`,
      description: `${Math.round((bestHour[1].replies / bestHour[1].total) * 100)}% reply rate at this hour.`,
      metric: "bestHour",
      value: bestHour[0],
    });
  }

  return insights;
}

// ── Analytics ────────────────────────────────────────────────

export async function getAcquisitionAnalytics(
  userId: string,
  range: "7d" | "30d" | "90d" | "this_month"
): Promise<WeeklyAnalytics & { monthlyPerformance: MonthlyPerformance }> {
  const now = new Date();
  let fromDate: string;
  const toDate = formatDate(now);

  switch (range) {
    case "7d": fromDate = formatDate(subDays(now, 6)); break;
    case "30d": fromDate = formatDate(subDays(now, 29)); break;
    case "90d": fromDate = formatDate(subDays(now, 89)); break;
    case "this_month": fromDate = formatDate(startOfMonth(now)); break;
  }

  const logs = await fetchLogs(userId, fromDate, toDate);
  const weekly = computeWeeklyAnalytics(logs, fromDate, toDate);
  const monthly = computeMonthlyPerformance(logs);

  return { ...weekly, monthlyPerformance: monthly };
}

// ── Forecast (standalone endpoint) ───────────────────────────

export async function getForecastData(userId: string): Promise<ForecastData> {
  const now = new Date();
  const monthStart = formatDate(startOfMonth(now));
  const today = formatDate(now);
  const logs = await fetchLogs(userId, monthStart, today);
  return computeForecast(logs);
}

// ── Utilities ────────────────────────────────────────────────

function generateDateRange(from: string, to: string): string[] {
  const dates: string[] = [];
  const current = new Date(from + "T12:00:00Z");
  const end = new Date(to + "T12:00:00Z");

  while (current <= end) {
    dates.push(formatDate(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
