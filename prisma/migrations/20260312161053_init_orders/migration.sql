-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('BUDGET', 'PRODUCTION', 'READY', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "ItemStatus" AS ENUM ('PREPRESS', 'QUEUE', 'PRINTED', 'FINISHING', 'DONE');

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "title" TEXT,
    "clientId" INTEGER NOT NULL,
    "sellerId" INTEGER NOT NULL,
    "shippingType" "ShippingType",
    "carrierId" INTEGER,
    "cityId" INTEGER,
    "status" "OrderStatus" NOT NULL DEFAULT 'PRODUCTION',
    "promisedDate" TEXT,
    "total" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "electronicPayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "cashPayment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "invoiceType" TEXT,
    "invoiceNumber" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderItem" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "assignedToId" INTEGER,
    "materialId" INTEGER NOT NULL,
    "fileName" TEXT,
    "widthMm" INTEGER NOT NULL,
    "heightMm" INTEGER NOT NULL,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "areaM2" DOUBLE PRECISION NOT NULL,
    "linearMeters" DOUBLE PRECISION,
    "finishing" TEXT,
    "notes" TEXT,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "subtotal" DOUBLE PRECISION NOT NULL,
    "status" "ItemStatus" NOT NULL DEFAULT 'PREPRESS',
    "proofApproved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Order_orderNumber_key" ON "Order"("orderNumber");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_sellerId_fkey" FOREIGN KEY ("sellerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_carrierId_fkey" FOREIGN KEY ("carrierId") REFERENCES "Carrier"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_materialId_fkey" FOREIGN KEY ("materialId") REFERENCES "Material"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
