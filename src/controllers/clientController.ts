import { Request, Response } from "express";
import * as clientService from "../services/clientService";

export const getClients = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 50;
    const search = req.query.search as string | undefined;

    const result = await clientService.getClientsPaginatedService(
      page,
      limit,
      search,
    );
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener los clientes" });
  }
};

export const getClientById = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params as { clientId: string };
    const id = parseInt(clientId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "El ID del cliente debe ser un número válido.",
      });
    }
    const client = await clientService.getClientByIdService(id);
    if (!client) {
      return res.status(404).json({ error: "Cliente no encontrado" });
    }
    res.json(client);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el cliente" });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    // req.body ahora puede recibir { name: "...", code: "...", categoryId: 1, shippingType: "RETIRA" }
    const client = await clientService.createClientService(req.body);
    res.status(201).json(client);
  } catch (error: any) {
    if (error.code === "P2002") {
      return res.status(400).json({ error: "El código de cliente ya existe." });
    }
    res.status(400).json({
      error: "Error al crear el cliente. Verifica los datos enviados.",
    });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params as { clientId: string };
    const id = parseInt(clientId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "El ID del cliente debe ser un número válido.",
      });
    }
    const client = await clientService.updateClientService(id, req.body);
    res.json(client);
  } catch (error) {
    res.status(400).json({ error: "Error al actualizar el cliente" });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { clientId } = req.params as { clientId: string };
    const id = parseInt(clientId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "El ID del cliente debe ser un número válido.",
      });
    }
    await clientService.deleteClientService(id);
    res.json({ message: "Cliente eliminado correctamente" });
  } catch (error) {
    res.status(400).json({
      error:
        "Error al eliminar el cliente. Es posible que tenga órdenes asociadas.",
    });
  }
};
