import { Schema, model, models } from "mongoose";

const noteSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    content: { type: String, required: true },
    isPinned: { type: Boolean, default: false },
    attachments: [{ type: String }],
  },
  { timestamps: true }
);

export const Note = models.Note ?? model("Note", noteSchema);
