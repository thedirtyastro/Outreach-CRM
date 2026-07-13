// ── Enums / Unions ─────────────────────────────────────────────

export type OutreachPlatform = "linkedin" | "twitter" | "github" | "instagram" | "email" | "website";
export type OutreachType = "connection" | "message" | "email" | "call";
export type OutreachStatus = "sent" | "viewed" | "replied" | "interested";
export type GoalSchedule = "today_only" | "daily" | "weekdays" | "custom";

// ── Database Models ────────────────────────────────────────────

export interface IAcquisitionGoal {
  id: string;
  userId: string;
  date: string; // YYYY-MM-DD
  targetContacts: number;
  linkedinTarget: number;
  twitterTarget: number;
  githubTarget: number;
  instagramTarget: number;
  emailTarget: number;
  callsTarget: number;
  meetingsTarget: number;
  revenueTarget: number;
  workingHours: number;
  notes?: string;
  schedule: GoalSchedule;
  customDays?: number[];
  createdAt: string;
  updatedAt: string;
}

export interface IOutreachLog {
  id: string;
  userId: string;
  leadId?: string;
  platform: OutreachPlatform;
  contactName: string;
  company?: string;
  outreachType: OutreachType;
  status: OutreachStatus;
  replied: boolean;
  meetingBooked: boolean;
  proposalSent: boolean;
  clientWon: boolean;
  revenue?: number;
  notes?: string;
  createdAt: string;
}

export interface IProductivityStreak {
  id: string;
  userId: string;
  currentStreak: number;
  longestStreak: number;
  completedDays: number;
  lastCompleted: string | null;
  createdAt: string;
  updatedAt: string;
}

// ── Dashboard Response Types ───────────────────────────────────

export interface AcquisitionDashboard {
  todaysProgress: TodaysProgress;
  funnel: FunnelStage[];
  weeklyAnalytics: WeeklyAnalytics;
  monthlyPerformance: MonthlyPerformance;
  platformProgress: PlatformProgress[];
  streak: StreakData;
  heatmap: DailyActivity[];
  insights: Insight[];
  forecast: ForecastData;
  recentLogs: IOutreachLog[];
}

export interface TodaysProgress {
  dailyTarget: number;
  contactsReached: number;
  repliesReceived: number;
  meetingsBooked: number;
  clientsWon: number;
  revenueGenerated: number;
  completionPercent: number;
}

export interface FunnelStage {
  name: string;
  count: number;
  conversionRate: number;
  dropOffPercent: number;
}

export interface WeeklyAnalytics {
  outreachPerDay: { date: string; count: number }[];
  repliesPerDay: { date: string; count: number }[];
  meetingsPerDay: { date: string; count: number }[];
  clientsPerDay: { date: string; count: number }[];
  revenuePerDay: { date: string; amount: number }[];
  avgResponseTime: number;
}

export interface MonthlyPerformance {
  totalContacts: number;
  totalReplies: number;
  replyRate: number;
  meetingRate: number;
  proposalRate: number;
  winRate: number;
  revenue: number;
  avgDealValue: number;
}

export interface PlatformProgress {
  platform: string;
  current: number;
  target: number;
  percent: number;
  color: string;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  completedDays: number;
  lastCompleted: string | null;
  badges: Badge[];
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  earned: boolean;
  earnedAt?: string;
  icon: string;
}

export interface DailyActivity {
  date: string; // YYYY-MM-DD
  count: number;
  goalMet: boolean;
}

export interface ForecastData {
  projectedMonthlyClients: number;
  projectedMonthlyRevenue: number;
  currentConversionRate: number;
  requiredDailyOutreach: number;
  confidence: "low" | "medium" | "high";
  historicalBasis: number;
}

export interface Insight {
  id: string;
  type: "tip" | "warning" | "achievement" | "suggestion";
  title: string;
  description: string;
  metric?: string;
  value?: number;
}
