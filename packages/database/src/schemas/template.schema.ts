import { Schema, model, models } from "mongoose";

const templateSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    subject: { type: String, required: true },
    body: { type: String, required: true },
    type: {
      type: String,
      enum: ["introduction", "follow_up", "reminder", "proposal", "meeting_confirmation", "thank_you", "custom"],
      default: "custom",
    },
    variables: [{ type: String }],
    isDefault: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Template = models.Template ?? model("Template", templateSchema);
