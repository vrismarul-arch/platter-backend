import mongoose from "mongoose";

const entrySchema = new mongoose.Schema({
  eventType: String,
  name: String,
  date: String,
  venue: String,
  audizeSize: String,
  duration: String,
  addOns: { portrait: Boolean, makingVideo: Boolean, musicSync: Boolean, customTheme: Boolean, liveMode: Boolean },
  contactName: String,
  contactEmail: String,
  contactPhone: String
}, { timestamps: true });

export default mongoose.model("Entry", entrySchema);
