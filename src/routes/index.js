import { Router } from "express";
import opportunityRoutes from "./opportunity.routes.js";

const router = Router();

router.use("/opportunities", opportunityRoutes);

export default router;
