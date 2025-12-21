/*
  Warnings:

  - You are about to drop the column `accountNo` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `admissionLetter` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `bankName` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `birthCertificate` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `certificateOfOrigin` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `department` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `faculty` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `lastSchoolFeeReciept` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `level` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `nameOfSchool` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `programDuration` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `regNo` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `school` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `schoolIdCard` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `ssceResult` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `subjectGrade` on the `applications` table. All the data in the column will be lost.
  - You are about to drop the column `year` on the `applications` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "applications_regNo_key";

-- AlterTable
ALTER TABLE "applications" DROP COLUMN "accountNo",
DROP COLUMN "admissionLetter",
DROP COLUMN "bankName",
DROP COLUMN "birthCertificate",
DROP COLUMN "certificateOfOrigin",
DROP COLUMN "department",
DROP COLUMN "faculty",
DROP COLUMN "lastSchoolFeeReciept",
DROP COLUMN "level",
DROP COLUMN "nameOfSchool",
DROP COLUMN "programDuration",
DROP COLUMN "regNo",
DROP COLUMN "school",
DROP COLUMN "schoolIdCard",
DROP COLUMN "ssceResult",
DROP COLUMN "subjectGrade",
DROP COLUMN "year";

-- CreateTable
CREATE TABLE "bank_details" (
    "applicationId" INTEGER NOT NULL,
    "accountNo" TEXT NOT NULL,
    "accountName" TEXT NOT NULL,
    "bankName" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "document_uploads" (
    "applicationId" INTEGER NOT NULL,
    "regNo" TEXT,
    "level" INTEGER,
    "programDuration" INTEGER,
    "schoolIdCard" TEXT,
    "certificateOfOrigin" TEXT,
    "ssceResult" TEXT,
    "birthCertificate" TEXT,
    "admissionLetter" TEXT,
    "lastSchoolFeeReciept" TEXT
);

-- CreateTable
CREATE TABLE "school_records" (
    "applicationId" INTEGER NOT NULL,
    "school" TEXT,
    "faculty" TEXT,
    "department" TEXT,
    "nameOfSchool" TEXT,
    "subjectGrade" TEXT,
    "year" INTEGER
);

-- CreateIndex
CREATE UNIQUE INDEX "bank_details_applicationId_accountNo_key" ON "bank_details"("applicationId", "accountNo");

-- CreateIndex
CREATE UNIQUE INDEX "document_uploads_applicationId_key" ON "document_uploads"("applicationId");

-- CreateIndex
CREATE UNIQUE INDEX "document_uploads_regNo_key" ON "document_uploads"("regNo");

-- CreateIndex
CREATE UNIQUE INDEX "school_records_applicationId_key" ON "school_records"("applicationId");

-- AddForeignKey
ALTER TABLE "bank_details" ADD CONSTRAINT "bank_details_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "document_uploads" ADD CONSTRAINT "document_uploads_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "school_records" ADD CONSTRAINT "school_records_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "applications"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
