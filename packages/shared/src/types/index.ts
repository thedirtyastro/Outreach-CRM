export type {
  IUser,
  ILead,
  IActivity,
  IEmail,
  IEmailEvent,
  IFollowUp,
  IMeeting,
  INote,
  IAttachment,
  ITemplate,
  INotification,
  ITag,
  ISettings,
} from "./models";

export type {
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

export type {
  PaginatedResponse,
  ApiResponse,
  DashboardStats,
  LeadFilters,
  LeadSort,
} from "./api";

export type {
  OutreachPlatform,
  OutreachType,
  OutreachStatus,
  GoalSchedule,
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
} from "./acquisition";
