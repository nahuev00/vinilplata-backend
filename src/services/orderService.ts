import prisma from "../config/db";
import { Prisma, OrderStatus, ItemStatus } from "../generated/prisma/client";

// Interfaz para definir cómo esperamos recibir los datos desde el frontend
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
  invoiceType?: string;
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

export interface UpdateOrderDTO {
  title?: string;
  shippingType?: any;
  carrierId?: number;
  cityId?: number;
  promisedDate?: string;
  total?: number;
  electronicPayment?: number;
  cashPayment?: number;
  invoiceType?: string;
  notes?: string;
  status?: OrderStatus;
}

export const createOrderService = async (data: CreateOrderDTO) => {
  // 1. Generar Número de Orden (Ej: ORD-2026-0001)
  const currentYear = new Date().getFullYear();
  const orderCount = await prisma.order.count();
  const orderNumber = `ORD-${currentYear}-${String(orderCount + 1).padStart(4, "0")}`;

  // 2. Preparar los ítems calculando el área (M2) automáticamente
  const itemsWithCalculations = data.items.map((item) => {
    const copies = item.copies || 1;
    // Fórmula M2: (Ancho * Alto / 1.000.000) * Copias
    const areaM2 = ((item.widthMm * item.heightMm) / 1000000) * copies;

    return {
      ...item,
      copies,
      areaM2,
      status: ItemStatus.PREIMPRESION, // Estado inicial por defecto
    };
  });

  // 3. Crear la Orden y sus Ítems en una sola transacción
  return await prisma.order.create({
    data: {
      orderNumber,
      clientId: data.clientId,
      sellerId: data.sellerId,
      title: data.title,
      shippingType: data.shippingType,
      carrierId: data.carrierId,
      cityId: data.cityId,
      promisedDate: data.promisedDate,
      total: data.total,
      electronicPayment: data.electronicPayment || 0,
      cashPayment: data.cashPayment || 0,
      invoiceType: data.invoiceType,
      notes: data.notes,
      status: OrderStatus.EN_PRODUCCION, // Ingresa directo a producción
      items: {
        create: itemsWithCalculations, // Prisma crea los OrderItems automáticamente
      },
    },
    // Incluimos las relaciones para devolver la orden completa al frontend
    include: {
      client: true,
      items: {
        include: { material: true, assignedTo: true },
      },
    },
  });
};

export const updateOrderService = async (id: number, data: UpdateOrderDTO) => {
  return await prisma.order.update({
    where: { id },
    data: {
      title: data.title,
      shippingType: data.shippingType,
      carrierId: data.carrierId,
      cityId: data.cityId,
      promisedDate: data.promisedDate,
      total: data.total,
      electronicPayment: data.electronicPayment,
      cashPayment: data.cashPayment,
      invoiceType: data.invoiceType,
      notes: data.notes,
      status: data.status,
    },
    // Devolvemos la orden actualizada con sus relaciones básicas para que el frontend
    // refresque la información sin necesidad de hacer otra llamada extra.
    include: {
      client: { select: { name: true, code: true } },
      seller: { select: { id: true, name: true } },
    },
  });
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
      orderBy: { createdAt: "desc" }, // Las más nuevas primero
      include: {
        client: { select: { name: true, code: true } }, // Solo traemos lo necesario del cliente
        seller: { select: { name: true } },
        items: true, // Traemos un resumen de los ítems
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
      items: {
        include: {
          material: true,
          assignedTo: { select: { id: true, name: true, role: true } }, // Puede ser la GZ_180 o Martín
        },
      },
    },
  });
};
