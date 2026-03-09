/*
  Warnings:

  - The `shippingType` column on the `Client` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "ShippingType" AS ENUM ('RGE', 'RETIRA', 'CORREO', 'EXPRESO');

-- AlterTable
ALTER TABLE "Client" DROP COLUMN "shippingType",
ADD COLUMN     "shippingType" "ShippingType";
