import express from "express";
import { addEntry } from "../controllers/entryController.js";

const router = express.Router();

// POST /api/entries/add
router.post("/add", addEntry);

export default router;
