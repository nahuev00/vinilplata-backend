/*
  Warnings:

  - The values [PREPRESS,QUEUE,PRINTED,FINISHING,DONE] on the enum `ItemStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [BUDGET,PRODUCTION,READY,DELIVERED,CANCELLED] on the enum `OrderStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ItemStatus_new" AS ENUM ('PREIMPRESION', 'EN_COLA', 'IMPRESO', 'TERMINACIONES', 'REALIZADO');
ALTER TABLE "public"."OrderItem" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "OrderItem" ALTER COLUMN "status" TYPE "ItemStatus_new" USING ("status"::text::"ItemStatus_new");
ALTER TYPE "ItemStatus" RENAME TO "ItemStatus_old";
ALTER TYPE "ItemStatus_new" RENAME TO "ItemStatus";
DROP TYPE "public"."ItemStatus_old";
ALTER TABLE "OrderItem" ALTER COLUMN "status" SET DEFAULT 'PREIMPRESION';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "OrderStatus_new" AS ENUM ('PRESUPUESTADO', 'EN_PRODUCCION', 'TERMINADO', 'ENTREGADO', 'CANCELADO');
ALTER TABLE "public"."Order" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Order" ALTER COLUMN "status" TYPE "OrderStatus_new" USING ("status"::text::"OrderStatus_new");
ALTER TYPE "OrderStatus" RENAME TO "OrderStatus_old";
ALTER TYPE "OrderStatus_new" RENAME TO "OrderStatus";
DROP TYPE "public"."OrderStatus_old";
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'EN_PRODUCCION';
COMMIT;

-- AlterTable
ALTER TABLE "Order" ALTER COLUMN "status" SET DEFAULT 'EN_PRODUCCION';

-- AlterTable
ALTER TABLE "OrderItem" ALTER COLUMN "status" SET DEFAULT 'PREIMPRESION';
