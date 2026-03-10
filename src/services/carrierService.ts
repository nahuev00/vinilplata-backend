import prisma from "../config/db";
import { Prisma, Carrier } from "../generated/prisma/client";
import { CarrierUpdateInput } from "../generated/prisma/models";

export const getAllCarriersService = async (): Promise<Carrier[]> => {
  return await prisma.carrier.findMany({
    orderBy: {
      name: "asc",
    },
  });
};

export const getCarrierByIdService = async (
  id: number,
): Promise<Carrier | null> => {
  return await prisma.carrier.findUnique({
    where: { id },
  });
};

export const createCarrierService = async (
  data: Prisma.CarrierCreateInput,
): Promise<Carrier> => {
  return await prisma.carrier.create({ data });
};

export const updateCarrierService = async (
  id: number,
  data: Prisma.CarrierUpdateInput,
): Promise<Carrier> => {
  return await prisma.carrier.update({
    where: { id },
    data,
  });
};

export const deleteCarrierService = async (id: number): Promise<Carrier> => {
  return await prisma.carrier.delete({
    where: { id },
  });
};
