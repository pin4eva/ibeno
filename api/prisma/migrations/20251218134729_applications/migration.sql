/*
  Warnings:

  - A unique constraint covering the columns `[programId,email,nin]` on the table `applications` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "applications_email_key";

-- DropIndex
DROP INDEX "applications_nin_key";

-- DropIndex
DROP INDEX "applications_phone_key";

-- CreateIndex
CREATE UNIQUE INDEX "applications_programId_email_nin_key" ON "applications"("programId", "email", "nin");
