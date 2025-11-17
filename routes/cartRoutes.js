import express from "express";
import {
  getCart,
  addToCart,
  removeItem,
  updateItem,
  clearCart,
} from "../controllers/cartController.js";

const router = express.Router();

router.get("/", getCart);
router.post("/add", addToCart);
router.post("/remove", removeItem);
router.post("/update", updateItem);
router.post("/clear", clearCart);

export default router;
