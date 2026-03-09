import prisma from "../config/db";
import { Prisma, Role } from "../generated/prisma/client";

export const getStationsService = async () => {
  return await prisma.user.findMany({
    where: { role: Role.STATION },
    select: { id: true, name: true, username: true, materials: true },
  });
};

export const createUserService = async (data: Prisma.UserCreateInput) => {
  const newUSer = await prisma.user.create({
    data: {
      username: data.username,
      name: data.name,
      password: data.password || null,
      role: data.role || Role.STATION,
    },
  });

  const { password: _, ...safeUser } = newUSer;
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
