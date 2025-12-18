/*
  Warnings:

  - You are about to drop the column `applicationSessionId` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the `application_sessions` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `programId` to the `applications` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `nin` on the `applications` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "applications" DROP COLUMN "applicationSessionId",
ADD COLUMN     "programId" INTEGER NOT NULL,
DROP COLUMN "nin",
ADD COLUMN     "nin" INTEGER NOT NULL;

-- DropTable
DROP TABLE "application_sessions";

-- CreateIndex
CREATE UNIQUE INDEX "applications_nin_key" ON "applications"("nin");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
