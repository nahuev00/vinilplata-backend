/*
  Warnings:

  - The `promisedDate` column on the `Order` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Order" 
ALTER COLUMN "promisedDate" TYPE TIMESTAMP(3) 
USING CASE 
    WHEN "promisedDate" = '' THEN NULL 
    ELSE "promisedDate"::timestamp without time zone 
END;