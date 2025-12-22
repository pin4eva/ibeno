/*
  Warnings:

  - A unique constraint covering the columns `[applicationId,accountNo]` on the table `bank_details` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "bank_details_accountNo_key";

-- CreateIndex
CREATE UNIQUE INDEX "bank_details_applicationId_accountNo_key" ON "bank_details"("applicationId", "accountNo");
