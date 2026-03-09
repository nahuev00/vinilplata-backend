import prisma from "../config/db";
import { Prisma, City } from "../generated/prisma/client";

export const getAllCitiesService = async (): Promise<City[]> => {
  return await prisma.city.findMany({
    orderBy: { name: "asc" },
  });
};

export const getCityBiIdService = async (id: number): Promise<City | null> => {
  return await prisma.city.findUnique({
    where: { id },
  });
};

export const createCityService = async (
  data: Prisma.CityCreateInput,
): Promise<City> => {
  return await prisma.city.create({
    data,
  });
};

export const updateCityService = async (
  id: number,
  data: Prisma.CityUpdateInput,
): Promise<City> => {
  return await prisma.city.delete({
    where: { id },
  });
};

export const deleteCityService = async (id: number): Promise<City> => {
  return await prisma.city.delete({
    where: { id },
  });
};
