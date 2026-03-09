import { Router } from "express";
import {
  getCities,
  getCityById,
  createCity,
  updateCity,
  deleteCity,
} from "../controllers/cityController";

const router = Router();

router.get("/", getCities);
router.get("/:cityId", getCityById);
router.post("/", createCity);
router.put("/:cityId", updateCity);
router.delete("/:cityId", deleteCity);

export default router;
