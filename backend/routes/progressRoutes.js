import express from "express";
import { saveProgress, getProgress } from "../controllers/progressController.js";

const router = express.Router();

router.post("/save", saveProgress);
router.get("/:roomId/:userName", getProgress);

export default router;
