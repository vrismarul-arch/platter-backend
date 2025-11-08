import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import entryRoutes from "./routes/entryRoutes.js";

dotenv.config();
const app = express();

// ✅ CORS for Netlify Frontend
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ["POST", "GET"]
}));

app.use(express.json());

// API Route
app.use("/api/entries", entryRoutes);

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.log("❌ DB Error:", err));

// Start Server
app.listen(process.env.PORT, () =>
  console.log(`🚀 Server running on port ${process.env.PORT}`)
);
