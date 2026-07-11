import { Schema, model, models } from "mongoose";

const tagSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true },
    color: { type: String, required: true, default: "#6366f1" },
  },
  { timestamps: true }
);

tagSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Tag = models.Tag ?? model("Tag", tagSchema);
