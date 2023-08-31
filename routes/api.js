import express from "express";
const router = express.Router();
import { apiController } from "../controllers";

router.get("/", apiController.api);
router.get("/api", apiController.api);

export default router;
