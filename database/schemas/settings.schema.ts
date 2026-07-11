import { Schema, model, models } from "mongoose";

const settingsSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    theme: { type: String, enum: ["dark", "light", "system"], default: "dark" },
    notifications: {
      email: { type: Boolean, default: true },
      desktop: { type: Boolean, default: true },
      followUpReminder: { type: Boolean, default: true },
      meetingReminder: { type: Boolean, default: true },
    },
    emailSettings: {
      signature: { type: String },
      defaultFrom: { type: String },
      trackOpens: { type: Boolean, default: true },
      trackClicks: { type: Boolean, default: true },
    },
    timezone: { type: String, default: "UTC" },
  },
  { timestamps: true }
);

export const Settings = models.Settings ?? model("Settings", settingsSchema);
