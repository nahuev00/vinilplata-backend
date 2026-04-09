import { Router } from "express";
import {
  getInvoiceTypes,
  createInvoiceType,
  deleteInvoiceType,
  updateInvoiceType,
} from "../controllers/invoiceTypeController";

const router = Router();

router.get("/", getInvoiceTypes);
router.post("/", createInvoiceType);
router.put("/:id", updateInvoiceType);
router.delete("/:id", deleteInvoiceType);

export default router;
