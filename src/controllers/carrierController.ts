import { Request, Response } from "express";
import * as carrierService from "../services/carrierService";
import prisma from "../config/db";

export const getCarriers = async (_req: Request, res: Response) => {
  try {
    const carriers = await carrierService.getAllCarriersService();
    res.json(carriers);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los comisionistas" });
  }
};

export const getCarrierById = async (req: Request, res: Response) => {
  try {
    const { carrierId } = req.params as { carrierId: string };
    const id = parseInt(carrierId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "El ID del COMISIONISTA debe ser un número válido.",
      });
    }

    const carrier = await carrierService.getCarrierByIdService(id);
    if (!carrier) {
      return res.status(404).json({ error: "Comisionista no encontrado" });
    }
    res.json(carrier);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el comisionista" });
  }
};

export const createCarrier = async (req: Request, res: Response) => {
  try {
    const carrier = await carrierService.createCarrierService(req.body);
    res.status(201).json(carrier);
  } catch (error) {
    res.status(400).json({
      error:
        "Error al crear el comisionista. Verifica que el nombre no esté duplicado.",
    });
  }
};

export const updateCarrier = async (req: Request, res: Response) => {
  try {
    const { carrierId } = req.params as { carrierId: string };
    const id = parseInt(carrierId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "El ID del COMISIONISTA debe ser un número válido.",
      });
    }

    const carrier = await carrierService.updateCarrierService(id, req.body);
    res.json(carrier);
  } catch (error) {
    res.status(400).json({ error: "Error al actualizar el comisionista" });
  }
};

export const deleteCarrier = async (req: Request, res: Response) => {
  try {
    const { carrierId } = req.params as { carrierId: string };
    const id = parseInt(carrierId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "El ID del COMISIONISTA debe ser un número válido.",
      });
    }

    await carrierService.deleteCarrierService(id);
    res.json({ message: "Comisionista eliminado correctamente" });
  } catch (error) {
    res.status(400).json({
      error:
        "Error al eliminar el comisionista. Es posible que esté asignado a uno o más clientes.",
    });
  }
};
