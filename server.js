import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

import productRoutes from "./routes/productRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import adminRoutes from "./routes/adminRoutes.js"; // <-- import admin routes
import cartRoutes from "./routes/cartRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";

dotenv.config();
const app = express();

// CORS
app.use(cors({
  origin: ["http://localhost:5173","https://getplattr.in","https://platter-vrism.netlify.app" ],
  methods: ["GET","POST","PUT","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// MongoDB Connection
if (!global._mongooseConnected) {
  mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 20000 })
    .then(() => {
      console.log("✅ MongoDB Connected");
      global._mongooseConnected = true;
    })
    .catch((err) => console.error("❌ MongoDB Connection Error:", err));
}

// Routes

app.use("/api/orders", orderRoutes);
app.use("/api/products", productRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/admin", adminRoutes); // <-- admin routes
app.use("/api/cart", cartRoutes);
app.use("/api/auth", authRoutes);
// Health check
app.get("/", (req, res) => res.send("✅ API is running..."));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
