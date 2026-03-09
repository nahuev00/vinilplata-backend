import prisma from "../config/db";
import { Prisma, Material } from "../generated/prisma/client";

export const getMaterialsService = async (): Promise<Material[]> => {
  return await prisma.material.findMany();
};

export const createMaterialService = async (
  data: Prisma.MaterialCreateInput,
): Promise<Material> => {
  return await prisma.material.create({
    data,
  });
};

export const updateMaterialService = async (
  id: number,
  data: Prisma.MaterialUpdateInput,
) => {
  return await prisma.material.update({
    where: { id },
    data,
  });
};

export const deleteMaterialService = async (id: number) => {
  return await prisma.material.delete({
    where: { id },
  });
};
