import prisma from "../config/db";
import { Prisma, OrderStatus, ItemStatus } from "../generated/prisma/client";

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
  invoiceTypeId?: number | null; // 👇 CAMBIO: Ahora es el ID relacional
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
  id?: number; // Opcional: Si viene, se actualiza. Si no, se crea.
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
  invoiceTypeId?: number | null; // 👇 CAMBIO: Ahora es el ID relacional
  invoiceNumber?: string | null;
  isPaid?: boolean;
  notes?: string;
  status?: OrderStatus;
  items?: UpdateOrderItemDTO[];
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
      shippingType: data.shippingType === "" ? undefined : data.shippingType,
      carrierId: data.carrierId,
      cityId: data.cityId,
      promisedDate: data.promisedDate ? new Date(data.promisedDate) : undefined,
      total: data.total,
      electronicPayment: data.electronicPayment || 0,
      cashPayment: data.cashPayment || 0,
      invoiceTypeId: data.invoiceTypeId, // 👇 CAMBIADO AQUÍ
      invoiceNumber: data.invoiceNumber,
      isPaid: data.isPaid,
      notes: data.notes,
      status: OrderStatus.EN_PRODUCCION, // Ingresa directo a producción
      items: {
        create: itemsWithCalculations, // Prisma crea los OrderItems automáticamente
      },
    },
    // Incluimos las relaciones para devolver la orden completa al frontend
    include: {
      client: true,
      invoiceType: true, // 👇 INCLUIMOS LA RELACIÓN PARA OBTENER EL NOMBRE
      items: {
        include: { material: true, assignedTo: true },
      },
    },
  });
};

export const updateOrderService = async (id: number, data: UpdateOrderDTO) => {
  // VALIDACIÓN ESTRICTA DE CANCELACIÓN
  if (data.status === OrderStatus.CANCELADO) {
    // Buscamos cómo están los ítems AHORA MISMO en la base de datos
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

  // Preparamos el payload base
  const updatePayload: Prisma.OrderUncheckedUpdateInput = {
    title: data.title === "" ? null : data.title,
    shippingType: data.shippingType === ("" as any) ? null : data.shippingType,
    carrierId: data.carrierId,
    cityId: data.cityId,
    promisedDate: data.promisedDate ? new Date(data.promisedDate) : null,
    total: data.total,
    electronicPayment: data.electronicPayment,
    cashPayment: data.cashPayment,
    invoiceTypeId: data.invoiceTypeId, // 👇 CAMBIADO AQUÍ
    notes: data.notes === "" ? null : data.notes,
    invoiceNumber: data.invoiceNumber === "" ? null : data.invoiceNumber,
    isPaid: data.isPaid,
    status: data.status,
  };

  // LÓGICA DE CASCADA Y UPSERT DE ÍTEMS
  if (data.status === OrderStatus.ENTREGADO) {
    updatePayload.items = {
      updateMany: { where: {}, data: { status: ItemStatus.ENTREGADO } },
    };
  } else if (data.status === OrderStatus.CANCELADO) {
    updatePayload.items = {
      updateMany: { where: {}, data: { status: ItemStatus.CANCELADO } },
    };
  } else if (data.items) {
    // Si la orden NO se canceló/entregó y el frontend nos mandó el array de ítems (Modo Edición)

    // 1. Identificamos qué IDs nos llegaron desde el frontend
    const incomingIds = data.items
      .map((i) => i.id)
      .filter((id) => id != null) as number[];

    // 2. Separamos los que son nuevos (no tienen ID) y les seteamos estado inicial
    const itemsToCreate = data.items
      .filter((i) => !i.id)
      .map((i) => ({ ...i, id: undefined, status: ItemStatus.PREIMPRESION }));

    // 3. Separamos los que ya existían y preparamos su actualización
    const itemsToUpdate = data.items
      .filter((i) => i.id)
      .map((i) => ({
        where: { id: i.id },
        data: { ...i, id: undefined }, // Quitamos el ID del data para que Prisma no se queje
      }));

    // 4. Armamos el bloque mágico de Prisma
    updatePayload.items = {
      // Si un ítem estaba en la BD pero ya no vino en el request, lo borramos
      deleteMany: { id: { notIn: incomingIds } },
      create: itemsToCreate,
      update: itemsToUpdate,
    };
  }

  // Ejecutamos la actualización
  return await prisma.order.update({
    where: { id },
    data: updatePayload,
    include: {
      client: { select: { name: true, code: true } },
      seller: { select: { id: true, name: true } },
      invoiceType: true, // 👇 INCLUIMOS LA RELACIÓN
      items: { include: { material: true } },
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
        client: true, // Solo traemos lo necesario del cliente
        carrier: true,
        city: true,
        invoiceType: true, // 👇 INCLUIMOS LA RELACIÓN
        seller: { select: { name: true } },
        items: {
          include: {
            assignedTo: { select: { id: true, name: true } },
          },
        }, // Traemos un resumen de los ítems
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
      invoiceType: true, // 👇 INCLUIMOS LA RELACIÓN
      items: {
        include: {
          material: true,
          assignedTo: { select: { id: true, name: true, role: true } }, // Puede ser la GZ_180 o Martín
        },
      },
    },
  });
};
