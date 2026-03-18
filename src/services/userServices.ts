import prisma from "../config/db";
import { Prisma, Role, ItemStatus } from "../generated/prisma/client";

export const getStationsService = async () => {
  return await prisma.user.findMany({
    where: { role: Role.STATION },
    select: {
      id: true,
      name: true,
      username: true,
      materials: true,
      printSpeedPerHour: true,
    },
  });
};

export const createUserService = async (data: Prisma.UserCreateInput) => {
  const newUSer = await prisma.user.create({
    data: {
      username: data.username,
      name: data.name,
      password: data.password || null,
      role: data.role || Role.STATION,
      materials: data.materials,
      printSpeedPerHour: data.printSpeedPerHour,
    },
    include: {
      materials: true,
    },
  });
  console.log(data);

  const { password: _, ...safeUser } = newUSer;
  return safeUser;
};

export const updateUserService = async (
  id: number,
  data: Prisma.UserUpdateInput,
) => {
  console.log(data);
  const updatedUser = await prisma.user.update({
    where: { id },
    data: {
      name: data.name,
      username: data.username,
      ...(data.password ? { password: data.password } : {}),
      materials: data.materials, // <-- Aquí insertaremos la relación con 'set'
      printSpeedPerHour: data.printSpeedPerHour,
    },
    include: {
      materials: true,
    },
  });

  const { password: _, ...safeUser } = updatedUser;
  return safeUser;
};

export const loginService = async (username: string, password?: string) => {
  const user = await prisma.user.findUnique({ where: { username } });

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (user.role === Role.ADMIN) {
    if (user.password !== password) {
      throw new Error("Contraseña incorrecta");
    }
  }

  // Retornamos los datos seguros sin la contraseña
  const { password: _, ...safeUser } = user;
  return safeUser;
};

// ------------------ Material SERVICE FUNCTION ---------------------

export const assignMaterialToStationService = async (
  userId: number,
  materialId: number,
) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      materials: {
        connect: {
          id: materialId,
        },
      },
    },
    include: {
      materials: true,
    },
  });
};

export const removeMaterialFromStationService = async (
  userId: number,
  materialId: number,
) => {
  return await prisma.user.update({
    where: { id: userId },
    data: {
      materials: {
        disconnect: { id: materialId },
      },
    },
    include: { materials: true },
  });
};

export const getStationsWorkloadService = async () => {
  // 1. Buscamos las estaciones y sus trabajos PENDIENTES
  const stations = await prisma.user.findMany({
    where: { role: Role.STATION },
    include: {
      assignedJobs: {
        where: {
          status: {
            in: [
              ItemStatus.PREIMPRESION,
              ItemStatus.EN_COLA,
              ItemStatus.IMPRESO,
            ],
          },
        },
      },
    },
  });

  // 2. Procesamos la matemática basada en METROS LINEALES
  const workload = stations.map((station) => {
    // 👇 CAMBIO CLAVE: Ahora sumamos item.linearMeters
    const totalPendingLinearMeters = station.assignedJobs.reduce(
      (sum, item) => sum + (item.linearMeters || 0),
      0,
    );
    const totalItems = station.assignedJobs.length;

    // Velocidad de la máquina en Metros Lineales / Hora
    const speed = station.printSpeedPerHour || 1;

    // Horas estimadas de trabajo continuo
    const estimatedHours = totalPendingLinearMeters / speed;

    return {
      id: station.id,
      name: station.name,
      printSpeedPerHour: station.printSpeedPerHour, // ML/h
      pendingItemsCount: totalItems,
      pendingLinearMeters: Number(totalPendingLinearMeters.toFixed(2)), // 👇 Enviamos los metros lineales
      estimatedHours: Number(estimatedHours.toFixed(1)), // Ej: 4.5 horas
    };
  });

  return workload;
};
