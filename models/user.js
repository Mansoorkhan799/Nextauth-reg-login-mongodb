import mongoose, { Schema, models } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true, // Ensures unique emails
    },
    password: {
      type: String,
      required: true,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // ✅ Allows multiple `null` values while keeping uniqueness for non-null values
    },
  },
  { timestamps: true }
);

const User = models.User || mongoose.model("User", userSchema);
export default User;
