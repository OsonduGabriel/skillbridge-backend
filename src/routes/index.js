import express from "express";
import cvRoutes from "./cv.routes.js";

const router = express.Router();

router.use("/cvs", cvRoutes);

export default router;