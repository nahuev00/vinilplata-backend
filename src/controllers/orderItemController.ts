import { Request, Response } from "express";
import * as orderItemService from "../services/orderItemService";
import { ItemStatus } from "../generated/prisma/client";

export const getOrderItems = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;

    // Filtros opcionales para las tablets de las máquinas
    const assignedToId = req.query.assignedToId
      ? parseInt(req.query.assignedToId as string)
      : undefined;
    const status = req.query.status as ItemStatus | undefined;

    const result = await orderItemService.getOrderItemsService(
      page,
      limit,
      assignedToId,
      status,
    );
    res.json(result);
  } catch (error) {
    console.error("Error al obtener los renglones:", error);
    res.status(500).json({ error: "Error al obtener los ítems de producción" });
  }
};

export const getOrderItemById = async (req: Request, res: Response) => {
  try {
    const { orderItemId } = req.params as { orderItemId: string };
    const id = parseInt(orderItemId, 10);
    const item = await orderItemService.getOrderItemByIdService(id);
    if (!item) {
      return res.status(404).json({ error: "Ítem no encontrado" });
    }
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el ítem" });
  }
};

export const updateOrderItem = async (req: Request, res: Response) => {
  try {
    const { orderItemId } = req.params as { orderItemId: string };
    const id = parseInt(orderItemId, 10);
    // El frontend puede enviar { assignedToId: 4 } para reasignar a la GZ_180
    // o { status: 'PRINTED' } para avanzar el trabajo
    const updatedItem = await orderItemService.updateOrderItemService(
      id,
      req.body,
    );
    res.json(updatedItem);
  } catch (error) {
    console.error("Error actualizando el ítem:", error);
    res
      .status(400)
      .json({ error: "Error al actualizar el ítem. Verifica los datos." });
  }
};
