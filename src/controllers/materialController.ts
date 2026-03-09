import { Request, Response } from "express";
import * as materialService from "../services/materialService";

export const getMaterials = async (_req: Request, res: Response) => {
  try {
    const materials = await materialService.getMaterialsService();
    res.json(materials);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los materiales" });
  }
};

export const createMaterial = async (req: Request, res: Response) => {
  try {
    const material = await materialService.createMaterialService(req.body);
    res.status(201).json(material);
  } catch (error) {
    res.status(400).json({ error: "Error al crear el material" });
  }
};

export const updateMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const materialId = parseInt(id, 10);

    if (isNaN(materialId)) {
      return res.status(400).json({
        message: "El ID del material debe ser un número válido.",
      });
    }

    const material = await materialService.updateMaterialService(
      materialId,
      req.body,
    );
    res.json(material);
  } catch (error) {
    res.status(400).json({ error: "Error al actualizar el material" });
  }
};

export const deleteMaterial = async (req: Request, res: Response) => {
  try {
    const { id } = req.params as { id: string };
    const materialId = parseInt(id, 10);

    if (isNaN(materialId)) {
      return res.status(400).json({
        message: "El ID del material debe ser un número válido.",
      });
    }
    await materialService.deleteMaterialService(materialId);
    res.json({ message: "Material eliminado correctamente" });
  } catch (error) {
    res.status(400).json({ error: "Error al eliminar el material" });
  }
};
