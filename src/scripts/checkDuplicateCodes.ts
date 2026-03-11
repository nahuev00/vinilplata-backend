import fs from "fs";
import path from "path";
import csv from "csv-parser";

const checkDuplicates = async () => {
  const filePath = path.join(__dirname, "../../data/clientes2.csv");

  const seenCodes = new Set<string>();
  const duplicateCodes = new Set<string>();

  console.log("🔍 Analizando códigos en clientes.csv...\n");

  fs.createReadStream(filePath)
    .pipe(
      csv({
        mapHeaders: ({ header }) =>
          header.trim().replace(/^[\uFEFF\xEF\xBB\xBF]+/, ""),
      }),
    )
    .on("data", (row) => {
      const code = row["Codigo"]?.trim();

      // Solo validamos si la fila tiene un código escrito
      if (code) {
        if (seenCodes.has(code)) {
          // Si ya lo habíamos visto, lo marcamos como duplicado
          duplicateCodes.add(code);
        } else {
          // Si es la primera vez, lo guardamos en los vistos
          seenCodes.add(code);
        }
      }
    })
    .on("end", () => {
      if (duplicateCodes.size === 0) {
        console.log("✅ No se encontraron códigos duplicados.");
      } else {
        console.log(
          `⚠️ Se encontraron ${duplicateCodes.size} códigos repetidos. Son los siguientes:\n`,
        );

        // Imprimimos la lista de los códigos problemáticos
        const duplicatesArray = Array.from(duplicateCodes).sort();
        duplicatesArray.forEach((code) => {
          console.log(`- ${code}`);
        });
      }
    })
    .on("error", (error) => {
      console.error("❌ Error leyendo el archivo:", error);
    });
};

checkDuplicates();
