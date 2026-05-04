/*
  Warnings:

  - You are about to drop the column `invoiceType` on the `Order` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "ItemStatus" ADD VALUE 'ENTREGADO';
ALTER TYPE "ItemStatus" ADD VALUE 'CANCELADO';

-- AlterTable
ALTER TABLE "Order" DROP COLUMN "invoiceType",
ADD COLUMN     "invoiceTypeId" INTEGER,
ADD COLUMN     "isPaid" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "InvoiceType" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "InvoiceType_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InvoiceType_name_key" ON "InvoiceType"("name");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_invoiceTypeId_fkey" FOREIGN KEY ("invoiceTypeId") REFERENCES "InvoiceType"("id") ON DELETE SET NULL ON UPDATE CASCADE;
