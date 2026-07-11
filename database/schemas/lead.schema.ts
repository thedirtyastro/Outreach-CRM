import mongoose, { Schema, model, models } from "mongoose";

const leadSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    designation: { type: String, trim: true },
    industry: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    whatsapp: { type: String, trim: true },
    website: { type: String, trim: true },
    linkedin: { type: String, trim: true },
    twitter: { type: String, trim: true },
    instagram: { type: String, trim: true },
    github: { type: String, trim: true },
    portfolio: { type: String, trim: true },
    location: { type: String, trim: true },
    bio: { type: String },
    profileImage: { type: String },
    tags: [{ type: String }],
    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },
    status: {
      type: String,
      enum: [
        "new", "initiated", "message_sent", "viewed", "responded",
        "interested", "meeting_scheduled", "proposal_sent", "negotiation",
        "waiting", "won", "lost", "ghosted", "rejected", "archived",
      ],
      default: "new",
      index: true,
    },
    platform: {
      type: String,
      enum: ["linkedin", "twitter", "instagram", "github", "website", "referral", "email", "other"],
      required: true,
      index: true,
    },
    response: {
      type: String,
      enum: ["positive", "negative", "neutral", "none"],
      default: "none",
    },
    budget: { type: Number },
    expectedRevenue: { type: Number },
    projectType: {
      type: String,
      enum: ["web_development", "mobile_app", "design", "consulting", "maintenance", "seo", "marketing", "other"],
    },
    lastContact: { type: Date },
    nextFollowUp: { type: Date },
    score: { type: Number, min: 0, max: 100 },
    isArchived: { type: Boolean, default: false, index: true },
    archivedAt: { type: Date },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

leadSchema.index({ userId: 1, createdAt: -1 });
leadSchema.index({ userId: 1, status: 1 });
leadSchema.index({ userId: 1, platform: 1 });
leadSchema.index({ name: "text", company: "text", email: "text" });

export const Lead = models.Lead ?? model("Lead", leadSchema);
