import { Router } from "express";
import {
  getStations,
  createUser,
  login,
  assignMaterial,
  removeMaterial,
} from "../controllers/userController";

const router = Router();
//-----station managment-----
router.get("/stations", getStations);
router.post("/create", createUser);
router.post("/login", login);
//---- material function-----
router.post("/:userId/materials", assignMaterial);
router.delete("/:userId/materials", removeMaterial);

export default router;
