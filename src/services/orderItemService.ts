import prisma from "../config/db";
import { Prisma, ItemStatus } from "../generated/prisma/client";

// Permite listar los ítems, ideal para la pantalla de cada máquina (filtrando por assignedToId)
export const getOrderItemsService = async (
  page: number = 1,
  limit: number = 50,
  assignedToId?: number,
  status?: ItemStatus,
) => {
  const skip = (page - 1) * limit;

  const whereCondition: Prisma.OrderItemWhereInput = {
    ...(assignedToId ? { assignedToId } : {}),
    ...(status ? { status } : {}),
  };

  const [total, items] = await prisma.$transaction([
    prisma.orderItem.count({ where: whereCondition }),
    prisma.orderItem.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { createdAt: "asc" }, // Los más viejos primero (FIFO)
      include: {
        order: {
          select: {
            orderNumber: true,
            promisedDate: true,
            client: { select: { name: true } },
          },
        },
        material: { select: { name: true } },
        assignedTo: { select: { name: true } },
      },
    }),
  ]);

  return {
    data: items,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getOrderItemByIdService = async (id: number) => {
  return await prisma.orderItem.findUnique({
    where: { id },
    include: {
      order: true,
      material: true,
      assignedTo: true,
    },
  });
};

// Interfaz para la actualización
export interface UpdateOrderItemDTO {
  assignedToId?: number | null;
  status?: ItemStatus;
  widthMm?: number;
  heightMm?: number;
  copies?: number;
  finishing?: string;
  notes?: string;
}

export const updateOrderItemService = async (
  id: number,
  data: UpdateOrderItemDTO,
) => {
  // Si nos envían nuevas medidas o cantidades, necesitamos recalcular el área
  let areaM2: number | undefined = undefined;

  if (data.widthMm || data.heightMm || data.copies) {
    // Buscamos el ítem actual para tener los valores base si falta alguno en el update
    const currentItem = await prisma.orderItem.findUnique({ where: { id } });
    if (currentItem) {
      const w = data.widthMm ?? currentItem.widthMm;
      const h = data.heightMm ?? currentItem.heightMm;
      const c = data.copies ?? currentItem.copies;
      areaM2 = ((w * h) / 1000000) * c;
    }
  }

  return await prisma.orderItem.update({
    where: { id },
    data: {
      ...data,
      ...(areaM2 !== undefined ? { areaM2 } : {}), // Solo actualiza el área si se recalculó
    },
    include: {
      assignedTo: { select: { name: true } },
      order: { select: { orderNumber: true } },
    },
  });
};
