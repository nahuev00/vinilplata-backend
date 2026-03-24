import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderItem,
  updateOrder,
} from "../controllers/orderController";

const router = Router();

router.post("/", createOrder);
router.get("/", getOrders);
router.get("/:orderId", getOrderById);
router.patch("/items/:itemId", updateOrderItem);
router.patch("/:orderId", updateOrder);

export default router;
