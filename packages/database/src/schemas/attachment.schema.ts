import { Schema, model, models } from "mongoose";

const attachmentSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead" },
    emailId: { type: Schema.Types.ObjectId, ref: "Email" },
    name: { type: String, required: true },
    url: { type: String, required: true },
    size: { type: Number, required: true },
    mimeType: { type: String, required: true },
  },
  { timestamps: true }
);

attachmentSchema.index({ userId: 1, createdAt: -1 });
attachmentSchema.index({ leadId: 1 });
attachmentSchema.index({ emailId: 1 });

export const Attachment = models.Attachment ?? model("Attachment", attachmentSchema);
