import prisma from "../config/db";
import { Prisma, OrderStatus, ItemStatus } from "../generated/prisma/client";
import { getIo } from "../config/socket"; // 👈 IMPORTAMOS EL SOCKET

// Interfaz para definir cómo esperamos recibir los datos desde el frontend al crear
export interface CreateOrderDTO {
  clientId: number;
  sellerId: number;
  title?: string;
  shippingType?: any;
  carrierId?: number;
  cityId?: number;
  promisedDate?: string;
  total: number;
  electronicPayment?: number;
  cashPayment?: number;
  invoiceTypeId?: number | null;
  invoiceNumber?: string | null;
  isPaid?: boolean;
  notes?: string;
  items: {
    materialId: number;
    assignedToId?: number;
    fileName?: string;
    widthMm: number;
    heightMm: number;
    copies?: number;
    finishing?: string;
    notes?: string;
    unitPrice: number;
    subtotal: number;
  }[];
}

// Interfaz para los ítems al actualizar (Upsert)
export interface UpdateOrderItemDTO {
  id?: number;
  materialId: number;
  fileName?: string | null;
  widthMm: number;
  heightMm: number;
  copies: number;
  finishing?: string | null;
  notes?: string | null;
  unitPrice: number;
  subtotal: number;
  areaM2: number;
}

// Interfaz para actualizar la orden
export interface UpdateOrderDTO {
  title?: string;
  shippingType?: any;
  carrierId?: number;
  cityId?: number;
  promisedDate?: string;
  total?: number;
  electronicPayment?: number;
  cashPayment?: number;
  invoiceTypeId?: number | null;
  invoiceNumber?: string | null;
  isPaid?: boolean;
  notes?: string;
  status?: OrderStatus;
  items?: UpdateOrderItemDTO[];
}

export const createOrderService = async (data: CreateOrderDTO) => {
  const currentYear = new Date().getFullYear();
  const orderCount = await prisma.order.count();
  const orderNumber = `ORD-${currentYear}-${String(orderCount + 1).padStart(4, "0")}`;

  const itemsWithCalculations = data.items.map((item) => {
    const copies = item.copies || 1;
    const areaM2 = ((item.widthMm * item.heightMm) / 1000000) * copies;

    return {
      ...item,
      copies,
      areaM2,
      status: ItemStatus.PREIMPRESION,
    };
  });

  const newOrder = await prisma.order.create({
    data: {
      orderNumber,
      clientId: data.clientId,
      sellerId: data.sellerId,
      title: data.title,
      shippingType: data.shippingType === "" ? undefined : data.shippingType,
      carrierId: data.carrierId,
      cityId: data.cityId,
      promisedDate: data.promisedDate ? new Date(data.promisedDate) : undefined,
      total: data.total,
      electronicPayment: data.electronicPayment || 0,
      cashPayment: data.cashPayment || 0,
      invoiceTypeId: data.invoiceTypeId,
      invoiceNumber: data.invoiceNumber,
      isPaid: data.isPaid,
      notes: data.notes,
      status: OrderStatus.EN_PRODUCCION,
      items: {
        create: itemsWithCalculations,
      },
    },
    include: {
      client: true,
      invoiceType: true,
      items: {
        include: { material: true, assignedTo: true },
      },
    },
  });

  // 👇 EMITIMOS EL EVENTO POR SOCKET AL CREAR 👇
  getIo().emit("ordersUpdated");

  return newOrder;
};

export const updateOrderService = async (id: number, data: UpdateOrderDTO) => {
  if (data.status === OrderStatus.CANCELADO) {
    const currentOrder = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    });

    const hasPrintingItems = currentOrder?.items.some(
      (item) => item.status === ItemStatus.IMPRIMIENDO,
    );

    if (hasPrintingItems) {
      throw new Error(
        "ACCION_DENEGADA: Hay ítems imprimiéndose. Detenga la máquina primero.",
      );
    }
  }

  const updatePayload: Prisma.OrderUncheckedUpdateInput = {
    title: data.title === "" ? null : data.title,
    shippingType: data.shippingType === ("" as any) ? null : data.shippingType,
    carrierId: data.carrierId,
    cityId: data.cityId,
    promisedDate: data.promisedDate ? new Date(data.promisedDate) : null,
    total: data.total,
    electronicPayment: data.electronicPayment,
    cashPayment: data.cashPayment,
    invoiceTypeId: data.invoiceTypeId,
    notes: data.notes === "" ? null : data.notes,
    invoiceNumber: data.invoiceNumber === "" ? null : data.invoiceNumber,
    isPaid: data.isPaid,
    status: data.status,
  };

  if (data.status === OrderStatus.ENTREGADO) {
    updatePayload.items = {
      updateMany: { where: {}, data: { status: ItemStatus.ENTREGADO } },
    };
  } else if (data.status === OrderStatus.CANCELADO) {
    updatePayload.items = {
      updateMany: { where: {}, data: { status: ItemStatus.CANCELADO } },
    };
  } else if (data.items) {
    const incomingIds = data.items
      .map((i) => i.id)
      .filter((id) => id != null) as number[];

    const itemsToCreate = data.items
      .filter((i) => !i.id)
      .map((i) => ({ ...i, id: undefined, status: ItemStatus.PREIMPRESION }));

    const itemsToUpdate = data.items
      .filter((i) => i.id)
      .map((i) => ({
        where: { id: i.id },
        data: { ...i, id: undefined },
      }));

    updatePayload.items = {
      deleteMany: { id: { notIn: incomingIds } },
      create: itemsToCreate,
      update: itemsToUpdate,
    };
  }

  const updatedOrder = await prisma.order.update({
    where: { id },
    data: updatePayload,
    include: {
      client: { select: { name: true, code: true } },
      seller: { select: { id: true, name: true } },
      invoiceType: true,
      items: { include: { material: true } },
    },
  });

  // 👇 EMITIMOS EL EVENTO POR SOCKET AL ACTUALIZAR 👇
  getIo().emit("ordersUpdated");

  return updatedOrder;
};

export const getOrdersPaginatedService = async (
  page: number = 1,
  limit: number = 50,
  search?: string,
) => {
  const skip = (page - 1) * limit;

  const whereCondition: Prisma.OrderWhereInput = search
    ? {
        OR: [
          { orderNumber: { contains: search, mode: "insensitive" } },
          { title: { contains: search, mode: "insensitive" } },
          { client: { name: { contains: search, mode: "insensitive" } } },
        ],
      }
    : {};

  const [total, orders] = await prisma.$transaction([
    prisma.order.count({ where: whereCondition }),
    prisma.order.findMany({
      where: whereCondition,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: {
        client: true,
        carrier: true,
        city: true,
        invoiceType: true,
        seller: { select: { name: true } },
        items: {
          include: {
            assignedTo: { select: { id: true, name: true } },
            logs: {
              include:{
                operator: true,
                station: true
              }
            }
          },
        },
      },
    }),
  ]);

  return {
    data: orders,
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
  };
};

export const getOrderByIdService = async (id: number) => {
  return await prisma.order.findUnique({
    where: { id },
    include: {
      client: true,
      seller: { select: { id: true, name: true } },
      carrier: true,
      city: true,
      invoiceType: true,
      items: {
        include: {
          material: true,
          assignedTo: { select: { id: true, name: true, role: true } },
        },
      },
    },
  });
};
