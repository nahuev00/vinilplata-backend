import { Request, Response } from "express";
import * as userService from "../services/userServices";
import { Prisma, Role } from "../generated/prisma/client";

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
    // 1. Extraemos lo que manda el frontend
    const { name, username, password, materialIds } = req.body;

    // 2. Traducimos al tipo Prisma.UserCreateInput
    const prismaInput: Prisma.UserCreateInput = {
      name,
      username,
      password,
      role: Role.STATION,
      // Usamos 'connect' para vincular los materiales existentes en la BD
      materials:
        materialIds && materialIds.length > 0
          ? {
              connect: materialIds.map((id: number) => ({ id })),
            }
          : undefined,
    };

    // 3. Llamamos al servicio
    const newStation = await userService.createUserService(prismaInput);
    res.status(201).json(newStation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al crear la estación" });
  }
};

export const updateStation = async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { name, username, password, materialIds } = req.body;

    // 2. Traducimos al tipo Prisma.UserUpdateInput
    const prismaInput: Prisma.UserUpdateInput = {
      name,
      username,
      password,
      // Usamos 'set' para borrar la lista anterior y clavar la nueva directamente
      materials: materialIds
        ? {
            set: materialIds.map((id: number) => ({ id })),
          }
        : undefined,
    };

    const updatedStation = await userService.updateUserService(
      Number(userId),
      prismaInput,
    );
    res.json(updatedStation);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al actualizar la estación" });
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
