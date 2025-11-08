import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  message: String,
}, { timestamps: true });

export default mongoose.model("Entry", entrySchema);
