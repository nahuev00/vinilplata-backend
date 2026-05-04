import { Request, Response } from "express";
import {
  getOperatorsService,
  createOperatorService,
} from "../services/operatorService";

export const getOperators = async (req: Request, res: Response) => {
  try {
    const operators = await getOperatorsService();
    res.json(operators);
  } catch (error) {
    console.error("Error obteniendo operarios:", error);
    res.status(500).json({ error: "Error al obtener los operarios" });
  }
};

export const createOperator = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({ error: "El nombre es obligatorio" });
    }

    const newOperator = await createOperatorService(name);
    res.status(201).json(newOperator);
  } catch (error) {
    console.error("Error creando operario:", error);
    res.status(500).json({ error: "Error al crear operario" });
  }
};
