import express from "express";
import {
  adminLogin,
  getDashboard,
  getAdminProfile,
} from "../controllers/adminController.js";
import { adminAuth } from "../middleware/adminAuth.js";

const router = express.Router();

router.post("/login", adminLogin);

// NEW PROFILE ROUTE
router.get("/profile", adminAuth, getAdminProfile);

router.get("/dashboard", adminAuth, getDashboard);

export default router;
