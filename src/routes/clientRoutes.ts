import { Router } from "express";
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from "../controllers/clientController";

const router = Router();

router.get("/", getClients);
router.get("/:clientId", getClientById);
router.post("/", createClient);
router.put("/:clientId", updateClient);
router.delete("/:clientId", deleteClient);

export default router;
