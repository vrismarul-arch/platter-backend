import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    name: String,
    email: String,
    googleId: String,
    picture: String,
    source: { type: String, default: "Google Login" },
    ip: String,
    userAgent: String,
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
