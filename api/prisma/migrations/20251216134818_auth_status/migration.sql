-- CreateEnum
CREATE TYPE "AuthStatusEnum" AS ENUM ('Active', 'Inactive', 'Locked');

-- AlterTable
ALTER TABLE "auths" ADD COLUMN     "lastLogin" TIMESTAMP(3),
ADD COLUMN     "status" "AuthStatusEnum" NOT NULL DEFAULT 'Active';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "permissions" TEXT[] DEFAULT ARRAY[]::TEXT[];
