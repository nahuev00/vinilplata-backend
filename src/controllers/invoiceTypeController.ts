import { Request, Response } from "express";
import * as invoiceTypeService from "../services/invoiceTypeService";

export const getInvoiceTypes = async (req: Request, res: Response) => {
  try {
    const types = await invoiceTypeService.getInvoiceTypesService();
    res.status(200).json({ data: types });
  } catch (error: any) {
    res.status(500).json({
      message: error.message || "Error al obtener los tipos de facturación",
    });
  }
};

export const createInvoiceType = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    const newType = await invoiceTypeService.createInvoiceTypeService(name);
    res
      .status(201)
      .json({ data: newType, message: "Tipo de facturación creado" });
  } catch (error: any) {
    res.status(400).json({
      message: error.message || "Error al crear el tipo de facturación",
    });
  }
};

export const deleteInvoiceType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await invoiceTypeService.deleteInvoiceTypeService(Number(id));
    res.status(200).json({ message: "Tipo de facturación eliminado" });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Error al eliminar" });
  }
};

export const updateInvoiceType = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const updatedType = await invoiceTypeService.updateInvoiceTypeService(
      Number(id),
      name,
    );
    res.status(200).json({ data: updatedType, message: "Tipo actualizado" });
  } catch (error: any) {
    res.status(400).json({ message: error.message || "Error al actualizar" });
  }
};
