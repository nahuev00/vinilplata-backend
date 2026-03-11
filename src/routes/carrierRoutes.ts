import { Router } from "express";
import {
  getCarriers,
  getCarrierById,
  createCarrier,
  updateCarrier,
  deleteCarrier,
} from "../controllers/carrierController";

const router = Router();

router.get("/", getCarriers);
router.get("/:carrierId", getCarrierById);
router.post("/", createCarrier);
router.put("/:carrierId", updateCarrier);
router.delete("/:carrierId", deleteCarrier);

export default router;
