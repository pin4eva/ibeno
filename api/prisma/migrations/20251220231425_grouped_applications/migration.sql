/*
  Warnings:

  - You are about to drop the column `lastSchoolFeeReciept` on the `document_uploads` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "document_uploads" DROP COLUMN "lastSchoolFeeReciept",
ADD COLUMN     "lastSchoolFeeReceipt" TEXT;
