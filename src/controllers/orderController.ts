// src/controllers/orderController.ts
import { Request, Response } from "express";
import * as orderService from "../services/orderService";
import prisma from "../config/db";
import { getIo } from "../config/socket";

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
    const updateData = req.body;

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

// ==========================================
// ACTUALIZACIÓN DE ÍTEMS CON LÓGICA DE DOBLE LOG
// ==========================================
export const updateOrderItem = async (req: Request, res: Response) => {
  try {
    const { itemId } = req.params;
    const { assignedToId, status, operatorId, stationId } = req.body;

    // 1. Buscamos el ítem actual
    const currentItem = await prisma.orderItem.findUnique({
      where: { id: Number(itemId) },
    });

    if (!currentItem) {
      return res.status(404).json({ error: "Ítem no encontrado" });
    }

    const transactionQueries: any[] = [];

    // 2. Si estaba IMPRIMIENDO y cambia de estado, generamos el log "IMPRESO" a nombre de esa máquina
    if (
      currentItem.status === "IMPRIMIENDO" &&
      status &&
      status !== "IMPRIMIENDO"
    ) {
      const lastLog = await prisma.itemLog.findFirst({
        where: { orderItemId: Number(itemId), status: "IMPRIMIENDO" },
        orderBy: { createdAt: "desc" },
      });

      const printOperatorId = operatorId
        ? Number(operatorId)
        : lastLog?.operatorId;

      transactionQueries.push(
        prisma.itemLog.create({
          data: {
            orderItemId: Number(itemId),
            operatorId: printOperatorId || null,
            stationId: stationId ? Number(stationId) : null,
            status: "IMPRESO",
          },
        }),
      );
    }

    // 3. Generamos el log del NUEVO estado solicitado
    // 👇 MAGIA AQUÍ: Bloqueamos la creación del log si el estado es "REALIZADO".
    // Así saltamos directo de IMPRESO a EMPAQUETADO en el historial visual.
    if (status && status !== "REALIZADO") {
      const targetStationId =
        assignedToId !== undefined && assignedToId !== null
          ? Number(assignedToId)
          : stationId
            ? Number(stationId)
            : null;

      transactionQueries.push(
        prisma.itemLog.create({
          data: {
            orderItemId: Number(itemId),
            operatorId: operatorId ? Number(operatorId) : null,
            stationId: targetStationId,
            status: status, // Será EN_COLA, EMPAQUETADO, ENTREGADO, etc.
          },
        }),
      );
    }

    // 4. Actualizamos el estado real del ítem (Esto SIEMPRE se hace para que cambie de columna)
    transactionQueries.push(
      prisma.orderItem.update({
        where: { id: Number(itemId) },
        data: {
          assignedToId: assignedToId !== undefined ? assignedToId : undefined,
          status: status !== undefined ? status : undefined,
        },
      }),
    );

    // 5. Ejecutamos la transacción
    const results = await prisma.$transaction(transactionQueries);

    const updatedItem = results[results.length - 1];

    getIo().emit("ordersUpdated");

    res.json(updatedItem);
  } catch (error) {
    console.error("Error al actualizar el ítem:", error);
    res.status(500).json({ error: "Error al actualizar el ítem" });
  }
};
