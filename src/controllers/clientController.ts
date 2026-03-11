import { Request, Response } from "express";
import * as clientService from "../services/clientService";

export const getClients = async (_req: Request, res: Response) => {
  try {
    const clients = await clientService.getAllClientsService();
    res.json(clients);
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
