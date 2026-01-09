import express from "express";
import {
  getCart,
  addToCart,
  removeItem,
  updateItem,
  clearCart,
} from "../controllers/cartController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// 🔐 ALL CART ROUTES PROTECTED
router.get("/", protect, getCart);
router.post("/add", protect, addToCart);
router.post("/remove", protect, removeItem);
router.post("/update", protect, updateItem);
router.post("/clear", protect, clearCart);

export default router;
