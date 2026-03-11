import { Request, Response } from "express";
import * as categoryService from "../services/categoryService";

export const getCategories = async (_req: Request, res: Response) => {
  try {
    const categories = await categoryService.getAllCategoriesService();
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los rubros" });
  }
};

export const getCategoryById = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params as { categoryId: string };
    const id = parseInt(categoryId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "El ID del RUBRO debe ser un número válido.",
      });
    }

    const category = await categoryService.getCategoryByIdService(id);

    if (!category) {
      return res.status(404).json({ error: "Rubro no encontrado" });
    }
    res.json(category);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el rubro" });
  }
};

export const createCategory = async (req: Request, res: Response) => {
  try {
    const category = await categoryService.createCategoryService(req.body);
    res.status(201).json(category);
  } catch (error) {
    res.status(400).json({
      error:
        "Error al crear el rubro. Verifica que el nombre no esté duplicado.",
    });
  }
};

export const updateCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params as { categoryId: string };
    const id = parseInt(categoryId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "El ID del RUBRO debe ser un número válido.",
      });
    }

    const category = await categoryService.updateCategoryService(id, req.body);
    res.json(category);
  } catch (error) {
    res.status(400).json({ error: "Error al actualizar el rubro" });
  }
};

export const deleteCategory = async (req: Request, res: Response) => {
  try {
    const { categoryId } = req.params as { categoryId: string };
    const id = parseInt(categoryId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "El ID del RUBRO debe ser un número válido.",
      });
    }
    await categoryService.deleteCategoryService(id);
    res.json({ message: "Rubro eliminado correctamente" });
  } catch (error) {
    // Si un cliente ya tiene asignado este rubro, no se podrá borrar
    res.status(400).json({
      error:
        "Error al eliminar el rubro. Es posible que esté asignado a uno o más clientes.",
    });
  }
};
