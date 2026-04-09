import prisma from "../config/db";

export const getInvoiceTypesService = async () => {
  return await prisma.invoiceType.findMany({
    orderBy: { name: "asc" }, // Los ordenamos alfabéticamente
  });
};

export const createInvoiceTypeService = async (name: string) => {
  // Validamos que no se cree vacío
  if (!name || name.trim() === "") {
    throw new Error("El nombre del tipo de facturación es obligatorio");
  }

  return await prisma.invoiceType.create({
    data: { name: name.trim().toUpperCase() }, // Lo guardamos en mayúsculas por prolijidad
  });
};

export const deleteInvoiceTypeService = async (id: number) => {
  // Opcional: Podrías validar aquí si este invoiceType está siendo usado en alguna Orden antes de borrarlo
  return await prisma.invoiceType.delete({
    where: { id },
  });
};

export const updateInvoiceTypeService = async (id: number, name: string) => {
  if (!name || name.trim() === "") throw new Error("El nombre es obligatorio");
  return await prisma.invoiceType.update({
    where: { id },
    data: { name: name.trim().toUpperCase() },
  });
};
