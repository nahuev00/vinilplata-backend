// prisma/seed.ts
import prisma from '../src/config/db'

async function main() {
  console.log("🌱 Iniciando el sembrado (seeding) de la base de datos...");

  // 1. Verificamos si ya existe algún administrador
  const existingAdmin = await prisma.user.findFirst({
    where: { role: "ADMIN" },
  });

  if (existingAdmin) {
    console.log(
      `✅ Ya existe un administrador en el sistema: ${existingAdmin.username}. No se requiere acción.`,
    );
    return;
  }

  // 2. Si no existe, preparamos las credenciales por defecto
  const defaultUsername = "admin";
  const defaultPassword = "password123";
  const defaultName = "Administrador Principal";

  // 3. Creamos el usuario en la base de datos (con la contraseña en texto plano)
  const admin = await prisma.user.create({
    data: {
      username: defaultUsername,
      name: defaultName,
      password: defaultPassword,
      role: "ADMIN",
    },
  });

  console.log(`🎉 ¡Éxito! Administrador inicial creado.`);
  console.log(`👤 Usuario: ${admin.username}`);
  console.log(`🔑 Contraseña: ${defaultPassword}`);
}

main()
  .catch((e) => {
    console.error("❌ Error durante el seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    // Cerramos la conexión de Prisma al terminar
    await prisma.$disconnect();
  });
