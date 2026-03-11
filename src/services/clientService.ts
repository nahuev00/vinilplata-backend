import prisma from "../config/db";
import { Prisma, Client } from "../generated/prisma/client";

export const getAllClientsService = async (): Promise<Client[]> => {
  return await prisma.client.findMany({
    orderBy: { name: "asc" },
    include: {
      category: true,
      city: true,
      carrier: true,
    },
  });
};

export const getClientByIdService = async (
  id: number,
): Promise<Client | null> => {
  return await prisma.client.findUnique({
    where: { id },
    include: {
      category: true,
      city: true,
      carrier: true,
    },
  });
};

// Usamos UncheckedCreateInput para poder pasar cityId, categoryId, etc. directamente como números
export const createClientService = async (
  data: Prisma.ClientUncheckedCreateInput,
): Promise<Client> => {
  return await prisma.client.create({
    data,
    include: { category: true, city: true, carrier: true },
  });
};

export const updateClientService = async (
  id: number,
  data: Prisma.ClientUncheckedUpdateInput,
): Promise<Client> => {
  return await prisma.client.update({
    where: { id },
    data,
    include: { category: true, city: true, carrier: true },
  });
};

export const deleteClientService = async (id: number): Promise<Client> => {
  return await prisma.client.delete({
    where: { id },
  });
};
