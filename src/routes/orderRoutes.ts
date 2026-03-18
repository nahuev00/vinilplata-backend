import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderItem,
} from "../controllers/orderController";

const router = Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:orderId", getOrderById);
router.patch("/items/:itemId", updateOrderItem);

export default router;
