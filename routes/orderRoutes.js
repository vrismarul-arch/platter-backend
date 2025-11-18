import express from "express";
import {
  createOrder,
  getAllOrders,
  updateOrderStatus,
  getMyOrders
} from "../controllers/orderController.js";

import { protect, adminOnly } from "../middleware/authMiddleware.js";

const router = express.Router();

// USER: create order
router.post("/", protect, createOrder);

// USER: get my orders
router.get("/my-orders", protect, getMyOrders);

// ADMIN: get all orders
router.get("/",  getAllOrders);

// ADMIN: update order status
router.put("/:orderId/status",  updateOrderStatus);

export default router;
