import fs from "fs";
import path from "path";
import csv from "csv-parser";
import prisma from "../config/db";
import { ShippingType } from "../generated/prisma/client";

// Función para generar un código único basado en el nombre (Ej: MAR001, MAR002)
const generateUniqueCode = (
  name: string,
  existingCodes: Set<string>,
): string => {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();

  let prefix = cleanName.substring(0, 3);
  if (prefix.length < 3) {
    prefix = prefix.padEnd(3, "X");
  }

  let counter = 1;
  let newCode = `${prefix}${counter.toString().padStart(3, "0")}`;

  while (existingCodes.has(newCode)) {
    counter++;
    newCode = `${prefix}${counter.toString().padStart(3, "0")}`;
  }

  existingCodes.add(newCode); // Lo registramos para esta ejecución
  return newCode;
};

const importDuplicates = async () => {
  const results: any[] = [];
  const filePath = path.join(__dirname, "../../data/clientes2.csv");

  console.log("⏳ Precargando relaciones y base de datos...");

  const categories = await prisma.category.findMany();
  const cities = await prisma.city.findMany();
  const carriers = await prisma.carrier.findMany();
  const existingClients = await prisma.client.findMany({
    select: { code: true },
  });

  const categoryMap = new Map(
    categories.map((c) => [c.name.trim().toLowerCase(), c.id]),
  );
  const cityMap = new Map(
    cities.map((c) => [c.name.trim().toLowerCase(), c.id]),
  );
  const carrierMap = new Map(
    carriers.map((c) => [c.name.trim().toLowerCase(), c.id]),
  );

  // existingCodes servirá para asegurar que el nuevo código generado no pise a ninguno de la BD
  const existingCodes = new Set(existingClients.map((c) => c.code));

  // Este Set es la clave del script: recordará qué códigos ya pasaron por el CSV
  const seenOriginalCodes = new Set<string>();

  console.log("⏳ Buscando y rescatando duplicados en clientes.csv...");

  fs.createReadStream(filePath)
    .pipe(
      csv({
        mapHeaders: ({ header }) =>
          header.trim().replace(/^[\uFEFF\xEF\xBB\xBF]+/, ""),
      }),
    )
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        const clientsToInsert: any[] = [];

        for (const row of results) {
          const name = row["inau"]?.trim() || row["Nombre de Busqueda"]?.trim();
          if (!name) continue;

          const originalCode = row["Codigo"]?.trim();

          // Si el cliente no tenía código de entrada, lo ignoramos (asumimos que otro script los trata)
          if (!originalCode) continue;

          // LOGICA DE DUPLICADOS:
          // Si es la primera vez que vemos este código en el CSV, es el que ya está en la BD. Lo registramos y lo salteamos.
          if (!seenOriginalCodes.has(originalCode)) {
            seenOriginalCodes.add(originalCode);
            continue;
          }

          // ¡Si llegamos aquí, significa que este código YA LO VIMOS antes en el CSV! Es un duplicado.
          console.log(
            `⚠️ Duplicado encontrado: "${name}" usaba el código repetido "${originalCode}". Generando uno nuevo...`,
          );

          // Le generamos su nuevo código único
          const newCode = generateUniqueCode(name, existingCodes);

          // Mapeo de Relaciones
          const categoryName = row["Rubro"]?.trim().toLowerCase();
          const categoryId = categoryName
            ? categoryMap.get(categoryName)
            : null;

          const cityName = row["Localidad"]?.trim().toLowerCase();
          const cityId = cityName ? cityMap.get(cityName) : null;

          const carrierName = row["Comisionista"]?.trim().toLowerCase();
          const carrierId = carrierName ? carrierMap.get(carrierName) : null;

          // Enums y descuentos
          let shippingType: ShippingType | null = null;
          const rawShipping = row["Tipo Envio"]?.trim().toUpperCase();
          if (
            rawShipping === "RGE" ||
            rawShipping === "RETIRA" ||
            rawShipping === "CORREO" ||
            rawShipping === "EXPRESO"
          ) {
            shippingType = rawShipping as ShippingType;
          }

          let discountVal = 0;
          const rawDiscount = row["Descuento"];
          if (rawDiscount && rawDiscount.trim() !== "") {
            const parsed = parseFloat(
              rawDiscount.replace("%", "").replace(",", "."),
            );
            if (!isNaN(parsed)) discountVal = parsed / 100;
          }

          clientsToInsert.push({
            code: newCode,
            name: name,
            searchName: row["Nombre de Busqueda"]?.trim() || null,
            address: row["Direccion"]?.trim() || null,
            phone: row["Telefono"]?.trim() || null,
            email: row["Mail"]?.trim() || null,
            altPhone: row["Otro Telefono"]?.trim() || null,
            taxCategory: row["Condicion IVA"]?.trim() || null,
            cuitDni: row["CUIT / DNI"]?.trim() || null,
            discount: discountVal,
            shippingType: shippingType,
            paymentTerms: row["Como Paga"]?.trim() || null,
            notes: row["Observaciones 1"]?.trim() || null,
            userMercadoPago: row["Usuario Mercado Pago"]?.trim() || null,
            categoryId: categoryId || null,
            cityId: cityId || null,
            carrierId: carrierId || null,
          });
        }

        console.log(
          `\n📦 Se encontraron y prepararon ${clientsToInsert.length} clientes duplicados.`,
        );

        if (clientsToInsert.length > 0) {
          const insertResult = await prisma.client.createMany({
            data: clientsToInsert,
            skipDuplicates: true,
          });
          console.log(
            `✅ ¡Éxito! Se importaron ${insertResult.count} clientes rescatados a la base de datos.`,
          );
        } else {
          console.log(`✅ No había duplicados pendientes por importar.`);
        }
      } catch (error) {
        console.error("❌ Error importando clientes duplicados:", error);
      } finally {
        await prisma.$disconnect();
      }
    });
};

importDuplicates();
