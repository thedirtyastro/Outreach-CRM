import { Schema, model, models } from "mongoose";

const activitySchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: [
        "lead_created", "lead_updated", "email_sent", "email_opened", "email_clicked",
        "meeting_added", "call_logged", "note_added", "proposal_uploaded",
        "project_won", "project_lost", "status_changed", "follow_up_created",
        "follow_up_completed", "attachment_added",
      ],
    },
    description: { type: String, required: true },
    icon: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

activitySchema.index({ userId: 1, createdAt: -1 });
activitySchema.index({ leadId: 1, createdAt: -1 });

export const Activity = models.Activity ?? model("Activity", activitySchema);
