// src/scripts/importCategory.ts
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import prisma from "../config/db";

const importCategories = async () => {
  const results: any[] = [];
  const filePath = path.join(__dirname, "../../data/rubros.csv");

  console.log("⏳ Leyendo archivo CSV...");

  fs.createReadStream(filePath)
    // Agregamos una configuración para limpiar los encabezados (quita espacios y caracteres invisibles BOM)
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
          console.log("🧐 Muestra de la primera fila detectada:", results[0]);
        }

        const categoriesToInsert: { name: string }[] = [];

        // Recorremos los resultados de forma segura
        for (const row of results) {
          // Tomamos el primer valor de la fila, sin importar cómo haya quedado el nombre de la columna
          const val = Object.values(row)[0];

          if (typeof val === "string" && val.trim() !== "") {
            categoriesToInsert.push({ name: val.trim() });
          }
        }

        console.log(
          `📦 Se encontraron ${categoriesToInsert.length} rubros listos para importar. Ejecutando inserción...`,
        );

        if (categoriesToInsert.length === 0) {
          console.log(
            '⚠️ No se encontraron datos válidos. Verifica si el CSV está separado por ";" en lugar de ",".',
          );
          return;
        }

        const insertResult = await prisma.category.createMany({
          data: categoriesToInsert,
          skipDuplicates: true,
        });

        console.log(
          `✅ ¡Éxito! Se importaron ${insertResult.count} rubros a la base de datos.`,
        );
      } catch (error) {
        console.error("❌ Error importando rubros:", error);
      } finally {
        await prisma.$disconnect();
      }
    });
};

importCategories();
