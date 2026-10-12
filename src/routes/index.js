import express from "express";
import cvRoutes from "./cv.routes.js";
import skillgapRoutes from "./skillgap.routes.js";

const router = express.Router();

router.use("/cvs", cvRoutes);
router.use("/skill-gaps", skillgapRoutes)

export default router;