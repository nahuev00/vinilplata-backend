import { Router } from "express";
import {
  getOrderItems,
  getOrderItemById,
  updateOrderItem,
} from "../controllers/orderItemController";

const router = Router();

// Ej: GET /api/order-items?assignedToId=3&status=QUEUE
router.get("/", getOrderItems);
router.get("/:orderItemId", getOrderItemById);

// Ej: PATCH /api/order-items/5 (Body: { "assignedToId": 4, "status": "QUEUE" })
router.patch("/:orderItemId", updateOrderItem);

export default router;
