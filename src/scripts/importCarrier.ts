import fs from "fs";
import path from "path";
import csv from "csv-parser";
import prisma from "../config/db";

const importCarriers = async () => {
  const results: any[] = [];
  const filePath = path.join(__dirname, "../../data/comisionistas.csv");

  console.log("⏳ Leyendo archivo CSV de comisionistas...");

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
        if (results.length > 0) {
          console.log("🧐 Muestra de la primera fila:", results[0]);
        }

        const carriersToInsert: any[] = [];

        for (const row of results) {
          const values = Object.values(row);

          // Mapeamos según el orden de columnas que tenía tu Excel
          const name = values[0]; // Comisionistas
          const contactInfo = values[1]; // Contactamos
          const phone = values[2]; // Telefono
          const pickupDays = values[3]; // Dias Retiro
          const locations = values[4]; // Localidades
          const arrivalTime = values[5]; // A que hora llegan

          // Solo insertamos si hay un nombre válido
          if (
            typeof name === "string" &&
            name.trim() !== "" &&
            name.trim() !== "A confirmar"
          ) {
            carriersToInsert.push({
              name: name.trim(),
              contactInfo:
                typeof contactInfo === "string" && contactInfo.trim() !== ""
                  ? contactInfo.trim()
                  : null,
              phone:
                typeof phone === "string" && phone.trim() !== ""
                  ? phone.trim()
                  : null,
              pickupDays:
                typeof pickupDays === "string" && pickupDays.trim() !== ""
                  ? pickupDays.trim()
                  : null,
              locations:
                typeof locations === "string" && locations.trim() !== ""
                  ? locations.trim()
                  : null,
              arrivalTime:
                arrivalTime !== undefined &&
                arrivalTime !== null &&
                String(arrivalTime).trim() !== ""
                  ? String(arrivalTime).trim()
                  : null,
            });
          }
        }

        console.log(
          `📦 Se encontraron ${carriersToInsert.length} comisionistas listos para importar. Ejecutando inserción...`,
        );

        if (carriersToInsert.length === 0) {
          console.log(
            "⚠️ No se encontraron datos válidos. Verifica el archivo CSV.",
          );
          return;
        }

        const insertResult = await prisma.carrier.createMany({
          data: carriersToInsert,
          skipDuplicates: true, // Evita errores si corres el script de nuevo
        });

        console.log(
          `✅ ¡Éxito! Se importaron ${insertResult.count} comisionistas a la base de datos.`,
        );
      } catch (error) {
        console.error("❌ Error importando comisionistas:", error);
      } finally {
        await prisma.$disconnect();
      }
    });
};

importCarriers();
