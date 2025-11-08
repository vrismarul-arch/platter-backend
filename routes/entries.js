import express from "express";
import multer from "multer";
import { addEntry } from "../controllers/entries.js";

const router = express.Router();

const upload = multer({ dest: "uploads/" });

router.post("/add", upload.array("images", 5), addEntry);

export default router;
