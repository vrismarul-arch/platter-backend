import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import entryRoutes from "./routes/entryRoutes.js";

dotenv.config();
const app = express();

// CORS for frontend
app.use(cors({ origin: process.env.CLIENT_URL }));

// Parse JSON
app.use(express.json());

// Routes
app.use("/api/entries", entryRoutes);

// MongoDB connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB Error:", err));

// Root test route
app.get("/", (req, res) => res.send("Backend Running ✅"));

// Start server
app.listen(process.env.PORT, () => console.log(`✅ Server running on port ${process.env.PORT}`));
