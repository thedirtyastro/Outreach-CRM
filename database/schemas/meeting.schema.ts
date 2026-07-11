import { Schema, model, models } from "mongoose";

const meetingSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    title: { type: String, required: true },
    description: { type: String },
    type: {
      type: String,
      enum: ["call", "video", "in_person", "other"],
      default: "video",
    },
    startTime: { type: Date, required: true, index: true },
    endTime: { type: Date },
    location: { type: String },
    meetingUrl: { type: String },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Meeting = models.Meeting ?? model("Meeting", meetingSchema);
