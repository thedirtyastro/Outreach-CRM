import { Schema, model, models } from "mongoose";

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    emailVerified: { type: Boolean, default: false },
    image: { type: String },
    password: { type: String },
  },
  { timestamps: true }
);

export const User = models.User ?? model("User", userSchema);
