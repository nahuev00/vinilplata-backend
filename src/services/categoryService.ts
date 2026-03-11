import prisma from "../config/db";
import { Prisma, Category } from "../generated/prisma/client";

export const getAllCategoriesService = async (): Promise<Category[]> => {
  return await prisma.category.findMany({
    orderBy: { name: "asc" },
  });
};

export const getCategoryByIdService = async (
  id: number,
): Promise<Category | null> => {
  return await prisma.category.findUnique({
    where: { id },
  });
};

export const createCategoryService = async (
  data: Prisma.CategoryCreateInput,
): Promise<Category> => {
  return await prisma.category.create({ data });
};

export const updateCategoryService = async (
  id: number,
  data: Prisma.CategoryUpdateInput,
): Promise<Category> => {
  return await prisma.category.update({
    where: { id },
    data,
  });
};

export const deleteCategoryService = async (id: number): Promise<Category> => {
  return await prisma.category.delete({
    where: { id },
  });
};
