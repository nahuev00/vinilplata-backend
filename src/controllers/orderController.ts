import { Request, Response } from "express";
import * as orderService from "../services/orderService";
import prisma from "../config/db";
import { getIo } from "../config/socket"; // 👈 ASEGÚRATE DE IMPORTAR ESTO

export const createOrder = async (req: Request, res: Response) => {
  try {
    const order = await orderService.createOrderService(req.body);
    res.status(201).json(order);
  } catch (error: any) {
    console.error("Error al crear orden:", error);
    res.status(400).json({
      error: "Error al crear la orden. Verifica los datos enviados.",
      details: error.message,
    });
  }
};

export const getOrders = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string | undefined;

    const result = await orderService.getOrdersPaginatedService(
      page,
      limit,
      search,
    );
    res.json(result);
  } catch (error) {
    console.error("Error al obtener órdenes:", error);
    res.status(500).json({ error: "Error al obtener las órdenes" });
  }
};

export const getOrderById = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params as { orderId: string };
    const id = parseInt(orderId, 10);
    const order = await orderService.getOrderByIdService(id);

    if (!order) {
      return res.status(404).json({ error: "Orden no encontrada" });
    }

    res.json(order);
  } catch (error) {
    console.error("Error al obtener la orden:", error);
    res.status(500).json({ error: "Error al obtener la orden" });
  }
};

export const updateOrder = async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const updateData = req.body; // Aquí puede venir { status: "TERMINADO" }

    const updatedOrder = await orderService.updateOrderService(
      Number(orderId),
      updateData,
    );

    res.json(updatedOrder);
  } catch (error) {
    console.error("Error al actualizar la orden:", error);
    res.status(500).json({ message: "Error interno del servidor" });
  }
};

export const updateOrderItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { assignedToId, status } = req.body;

    const updatedItem = await prisma.orderItem.update({
      where: { id: Number(itemId) },
      data: {
        assignedToId: assignedToId !== undefined ? assignedToId : undefined,
        status: status !== undefined ? status : undefined,
      },
    });

    // 👇 ¡AQUÍ ESTÁ LA MAGIA QUE FALTABA! 👇
    getIo().emit("ordersUpdated");

    res.json(updatedItem);
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar el ítem" });
  }
};
