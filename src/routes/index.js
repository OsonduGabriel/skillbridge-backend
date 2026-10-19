import { Router } from "express";
import opportunityRoutes from "./opportunity.routes.js";
import roadmapRoutes from "./roadmap.routes.js";

const router = Router();

router.use("/opportunities", opportunityRoutes);
router.use("/roadmaps", roadmapRoutes);

export default router;
