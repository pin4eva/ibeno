-- AlterTable
ALTER TABLE "applications" ADD COLUMN     "complete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "bank_details" ADD COLUMN     "complete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "document_uploads" ADD COLUMN     "complete" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "school_records" ADD COLUMN     "complete" BOOLEAN NOT NULL DEFAULT false;
