/*
  Warnings:

  - You are about to drop the column `level` on the `document_uploads` table. All the data in the column will be lost.
  - You are about to drop the column `programDuration` on the `document_uploads` table. All the data in the column will be lost.
  - You are about to drop the column `regNo` on the `document_uploads` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[regNo]` on the table `school_records` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "document_uploads_regNo_key";

-- AlterTable
ALTER TABLE "document_uploads" DROP COLUMN "level",
DROP COLUMN "programDuration",
DROP COLUMN "regNo";

-- AlterTable
ALTER TABLE "school_records" ADD COLUMN     "level" INTEGER,
ADD COLUMN     "programDuration" INTEGER,
ADD COLUMN     "regNo" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "school_records_regNo_key" ON "school_records"("regNo");
