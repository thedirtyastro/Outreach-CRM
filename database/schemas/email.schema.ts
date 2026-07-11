import { Schema, model, models } from "mongoose";

const emailSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    messageId: { type: String },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    html: { type: String },
    from: { type: String, required: true },
    to: { type: String, required: true },
    status: {
      type: String,
      enum: ["draft", "sent", "failed"],
      default: "draft",
    },
    threadId: { type: String },
    attachments: [{ type: String }],
    openedAt: { type: Date },
    clickedAt: { type: Date },
    repliedAt: { type: Date },
  },
  { timestamps: true }
);

emailSchema.index({ userId: 1, createdAt: -1 });
emailSchema.index({ leadId: 1, createdAt: -1 });

export const Email = models.Email ?? model("Email", emailSchema);

const emailEventSchema = new Schema(
  {
    emailId: { type: Schema.Types.ObjectId, ref: "Email", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true },
    type: {
      type: String,
      required: true,
      enum: ["delivered", "opened", "clicked", "bounced", "complained", "replied"],
    },
    data: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

export const EmailEvent = models.EmailEvent ?? model("EmailEvent", emailEventSchema);
