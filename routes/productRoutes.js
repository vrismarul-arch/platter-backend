import express from "express";   // ⭐ ADD THIS
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  upload,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getProducts);

// ⭐ Your missing route
router.get("/:id", getProductById);

router.post("/", upload.single("image"), createProduct);
router.put("/:id", upload.single("image"), updateProduct);
router.delete("/:id", deleteProduct);

export default router;
