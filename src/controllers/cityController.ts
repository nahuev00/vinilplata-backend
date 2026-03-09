import { Request, Response } from "express";
import * as cityService from "../services/cityService";

export const getCities = async (_req: Request, res: Response) => {
  try {
    const cities = await cityService.getAllCitiesService();
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener las localidades" });
  }
};

export const getCityById = async (req: Request, res: Response) => {
  try {
    const { cityId } = req.params as { cityId: string };
    const id = parseInt(cityId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "El ID de la LOCALIDAD debe ser un número válido.",
      });
    }

    const city = await cityService.getCityBiIdService(id);

    if (!city) {
      return res.status(404).json({ error: "Localidad no encontrada" });
    }
    res.json(city);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener la localidad" });
  }
};

export const createCity = async (req: Request, res: Response) => {
  try {
    const city = await cityService.createCityService(req.body);
    res.status(200).json(city);
  } catch (error) {
    res.status(400).json({
      error: "Error al crear la localidad. Es posible que ya exista.",
    });
  }
};

export const updateCity = async (req: Request, res: Response) => {
  try {
    const { cityId } = req.params as { cityId: string };
    const id = parseInt(cityId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "El ID de la LOCALIDAD debe ser un número válido.",
      });
    }
    const city = await cityService.updateCityService(id, req.body);
    res.json(city);
  } catch (error) {
    res.status(400).json({ error: "Error al actualizar la localidad" });
  }
};

export const deleteCity = async (req: Request, res: Response) => {
  try {
    const { cityId } = req.params as { cityId: string };
    const id = parseInt(cityId, 10);

    if (isNaN(id)) {
      return res.status(400).json({
        message: "El ID de la LOCALIDAD debe ser un número válido.",
      });
    }

    await cityService.deleteCityService(id);
    res.json({ message: "Localidad eliminada correctamente" });
  } catch (error) {
    res
      .status(400)
      .json({
        error:
          "Error al eliminar la localidad. Verifica que no esté asignada a ningún cliente.",
      });
  }
};
