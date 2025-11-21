import express from "express";
import {
  getLeads,
  createLead,
  deleteLead
} from "../controllers/leadController.js";

const router = express.Router();

// GET all leads
router.get("/", getLeads);

// Create a lead (optional)
router.post("/", createLead);

// Delete a lead
router.delete("/:id", deleteLead);

export default router;
