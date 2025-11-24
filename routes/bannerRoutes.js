import express from "express";
import {
  createBanner,
  getBanners,
  updateBanner,
  deleteBanner,
  upload,
} from "../controllers/bannerController.js";

const router = express.Router();

router.get("/", getBanners);

// CREATE (desktop + mobile)
router.post("/", upload, createBanner);

// UPDATE
router.put("/:id", upload, updateBanner);

// DELETE
router.delete("/:id", deleteBanner);

export default router;
