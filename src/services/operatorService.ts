import prisma from "../config/db"; // (Ajusta la ruta de tu prisma client)

export const getOperatorsService = async () => {
  return await prisma.operator.findMany({
    orderBy: { name: "asc" },
  });
};

export const createOperatorService = async (name: string) => {
  return await prisma.operator.create({
    data: { name },
  });
};
