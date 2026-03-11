import fs from "fs";
import path from "path";
import csv from "csv-parser";
import prisma from "../config/db";

const importCities = async () => {
  const results: any[] = [];
  const filePath = path.join(__dirname, "../../data/localidades.csv");

  console.log("⏳ Leyendo archivo CSV de localidades...");

  fs.createReadStream(filePath)
    .pipe(
      csv({
        // Limpiamos los encabezados igual que antes
        mapHeaders: ({ header }) =>
          header.trim().replace(/^[\uFEFF\xEF\xBB\xBF]+/, ""),
      }),
    )
    .on("data", (data) => results.push(data))
    .on("end", async () => {
      try {
        if (results.length > 0) {
          console.log("🧐 Muestra de la primera fila detectada:", results[0]);
        }

        // Usamos un Map para evitar que haya localidades duplicadas dentro del mismo Excel
        const uniqueCities = new Map<
          string,
          { name: string; province?: string | null }
        >();

        for (const row of results) {
          // Extraemos los valores por su posición (0 = Localidad, 1 = Provincia)
          const values = Object.values(row);
          const cityName = values[0];
          const provinceName = values[1];

          if (typeof cityName === "string" && cityName.trim() !== "") {
            const cleanName = cityName.trim();

            // Si la localidad no fue agregada aún al Map, la sumamos
            if (!uniqueCities.has(cleanName)) {
              uniqueCities.set(cleanName, {
                name: cleanName,
                // Si la columna provincia tiene texto, lo guardamos, si no, queda en null
                province:
                  typeof provinceName === "string" && provinceName.trim() !== ""
                    ? provinceName.trim()
                    : null,
              });
            }
          }
        }

        const citiesToInsert = Array.from(uniqueCities.values());

        console.log(
          `📦 Se encontraron ${citiesToInsert.length} localidades únicas listas para importar. Ejecutando inserción...`,
        );

        if (citiesToInsert.length === 0) {
          console.log(
            "⚠️ No se encontraron datos válidos. Verifica el archivo.",
          );
          return;
        }

        const insertResult = await prisma.city.createMany({
          data: citiesToInsert,
          skipDuplicates: true, // Si ya existe en PostgreSQL, la ignora sin tirar error
        });

        console.log(
          `✅ ¡Éxito! Se importaron ${insertResult.count} localidades a la base de datos.`,
        );
      } catch (error) {
        console.error("❌ Error importando localidades:", error);
      } finally {
        await prisma.$disconnect();
      }
    });
};

importCities();
