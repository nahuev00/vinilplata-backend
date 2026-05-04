-- AlterTable
ALTER TABLE "ItemLog" ADD COLUMN     "stationId" INTEGER;

-- AddForeignKey
ALTER TABLE "ItemLog" ADD CONSTRAINT "ItemLog_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
