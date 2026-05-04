import { Router } from "express";
import {
  getOperators,
  createOperator,
} from "../controllers/operatorController";

const router = Router();

router.get("/", getOperators);
router.post("/", createOperator);

export default router;
