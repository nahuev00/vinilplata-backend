import prisma from "../config/db";

const countClients = async () => {
  try {
    // La magia de Prisma: .count() devuelve el número total de filas
    const totalClients = await prisma.client.count();

    console.log(
      `📊 Tienes un total de ${totalClients} clientes en tu base de datos.`,
    );
  } catch (error) {
    console.error("Error al contar los clientes:", error);
  } finally {
    await prisma.$disconnect();
  }
};

countClients();
