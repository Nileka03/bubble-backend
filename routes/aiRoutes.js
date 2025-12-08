import express from "express";
import { protectRoute } from "../middleware/auth.js";
import { getSmartReplies } from "../controllers/aiController.js";

const router = express.Router();

router.post("/smart-replies/:id", protectRoute, getSmartReplies);

export default router;