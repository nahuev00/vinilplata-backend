import { Router } from "express";
import {
  getStations,
  createUser,
  login,
  assignMaterial,
  removeMaterial,
  updateStation,
  getStationsWorkload,
} from "../controllers/userController";

const router = Router();
//-----station managment-----
router.get("/stations", getStations);
router.post("/create", createUser);
router.put("/:userId", updateStation);
router.post("/login", login);
router.get("/workload", getStationsWorkload);
//---- material function-----
router.post("/:userId/materials", assignMaterial);
router.delete("/:userId/materials", removeMaterial);

export default router;
