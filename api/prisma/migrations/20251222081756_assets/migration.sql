-- Create table if it does not already exist (succeeds on replays)
CREATE TABLE IF NOT EXISTS "assets" (
  "id" SERIAL NOT NULL,
  "name" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "location" TEXT NOT NULL,
  "assetNumber" TEXT NOT NULL,
  "imageUrl" TEXT,
  "assetType" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);
-- Ensure unique index exists without failing if already present
DO $$ BEGIN IF NOT EXISTS (
  SELECT 1
  FROM pg_indexes
  WHERE schemaname = CURRENT_SCHEMA()
    AND indexname = 'assets_assetNumber_key'
) THEN CREATE UNIQUE INDEX "assets_assetNumber_key" ON "assets"("assetNumber");
END IF;
END $$;
