import { Schema, model, models } from "mongoose";

const followUpSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    dueDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "completed", "overdue", "cancelled"],
      default: "pending",
      index: true,
    },
    isRecurring: { type: Boolean, default: false },
    recurringInterval: { type: Number },
    recurringUnit: { type: String, enum: ["days", "weeks", "months"] },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

followUpSchema.index({ userId: 1, dueDate: 1 });
followUpSchema.index({ userId: 1, status: 1 });

export const FollowUp = models.FollowUp ?? model("FollowUp", followUpSchema);
