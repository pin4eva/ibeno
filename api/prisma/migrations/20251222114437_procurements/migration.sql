-- CreateEnum
CREATE TYPE "ProcurementStatusEnum" AS ENUM ('draft', 'published', 'closed', 'awarded', 'archived');

-- CreateEnum
CREATE TYPE "BidStatusEnum" AS ENUM ('submitted', 'under_review', 'accepted', 'rejected', 'withdrawn', 'awarded');

-- CreateTable
CREATE TABLE "contractors" (
    "id" SERIAL NOT NULL,
    "contractorNo" TEXT NOT NULL,
    "oldRegNo" TEXT,
    "cacRegNo" TEXT,
    "companyName" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "registrationCategory" TEXT,
    "majorArea" TEXT,
    "subArea" TEXT,
    "stateOfOrigin" TEXT,
    "community" TEXT,
    "contactPerson" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "notes" TEXT,
    "sourceSheet" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contractors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurements" (
    "id" SERIAL NOT NULL,
    "referenceNo" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "eligibilityCriteria" TEXT,
    "submissionDeadline" TIMESTAMP(3) NOT NULL,
    "publishDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ProcurementStatusEnum" NOT NULL DEFAULT 'draft',
    "budgetEstimate" DOUBLE PRECISION,
    "preBidMeetingDate" TIMESTAMP(3),
    "preBidMeetingLocation" TEXT,
    "preBidNotes" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "createdBy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procurements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procurement_documents" (
    "id" SERIAL NOT NULL,
    "procurementId" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "mimeType" TEXT,
    "size" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "procurement_documents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bids" (
    "id" SERIAL NOT NULL,
    "procurementId" INTEGER NOT NULL,
    "contractorId" INTEGER NOT NULL,
    "contractorNo" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "price" DOUBLE PRECISION,
    "technicalProposalUrl" TEXT,
    "commercialProposalUrl" TEXT,
    "otherFiles" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "notes" TEXT,
    "status" "BidStatusEnum" NOT NULL DEFAULT 'submitted',
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bids_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bid_events" (
    "id" SERIAL NOT NULL,
    "bidId" INTEGER NOT NULL,
    "action" TEXT NOT NULL,
    "actorId" INTEGER,
    "actorRole" TEXT,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bid_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contractors_contractorNo_key" ON "contractors"("contractorNo");

-- CreateIndex
CREATE UNIQUE INDEX "procurements_referenceNo_key" ON "procurements"("referenceNo");

-- CreateIndex
CREATE UNIQUE INDEX "bids_procurementId_contractorId_key" ON "bids"("procurementId", "contractorId");

-- AddForeignKey
ALTER TABLE "procurement_documents" ADD CONSTRAINT "procurement_documents_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "procurements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_procurementId_fkey" FOREIGN KEY ("procurementId") REFERENCES "procurements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bids" ADD CONSTRAINT "bids_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "contractors"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bid_events" ADD CONSTRAINT "bid_events_bidId_fkey" FOREIGN KEY ("bidId") REFERENCES "bids"("id") ON DELETE CASCADE ON UPDATE CASCADE;
