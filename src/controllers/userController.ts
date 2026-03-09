import { Request, Response } from "express";
import * as userService from "../services/userServices";

export const getStations = async (_req: Request, res: Response) => {
  try {
    const stations = await userService.getStationsService();
    res.status(200).json(stations);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las estaciones" });
  }
};

export const createUser = async (req: Request, res: Response) => {
  try {
    const newUser = await userService.createUserService(req.body);
    res.status(201).json(newUser);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al crear el usuario. Verifica los datos." });
  }
};

export const login = async (req: Request, res: Response) => {
  const { username, password } = req.body;

  try {
    const user = await userService.loginService(username, password);
    res.status(200).json({ message: "Login exitoso", user });
  } catch (error: any) {
    const status = error.message === "Usuario no encontrado" ? 404 : 401;
    res.status(status).json({ error: error.message });
  }
};

//--------------------- Material Functions -----------------------
export const assignMaterial = async (req: Request, res: Response) => {
  try {
    const materialId = parseInt(req.body.materialId);
    const { userId } = req.params as { userId: string };
    const user = parseInt(userId, 10);

    if (isNaN(user)) {
      return res.status(400).json({
        message: "El ID del usuario debe ser un número válido.",
      });
    }

    const updatedStation = await userService.assignMaterialToStationService(
      user,
      materialId,
    );
    res.json(updatedStation);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al asignar el material a la estación" });
  }
};

export const removeMaterial = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params as { userId: string };
    const user = parseInt(userId, 10);

    if (isNaN(user)) {
      return res.status(400).json({
        message: "El ID del usuario debe ser un número válido.",
      });
    }
    const materialId = parseInt(req.body.materialId);
    const updatedStation = await userService.removeMaterialFromStationService(
      user,
      materialId,
    );
    res.json(updatedStation);
  } catch (error) {
    res
      .status(400)
      .json({ error: "Error al remover el material de la estación" });
  }
};
