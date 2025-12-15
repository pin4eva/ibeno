/*
  Warnings:

  - You are about to drop the column `name` on the `User` table. All the data in the column will be lost.
  - Added the required column `firstName` to the `User` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "UserRoleEnum" AS ENUM ('User', 'Admin', 'Editor', 'Developer', 'Student', 'Contractor');

-- CreateEnum
CREATE TYPE "UserStatusEnum" AS ENUM ('Active', 'Inactive', 'Suspended', 'Blocked');

-- CreateEnum
CREATE TYPE "DepartmentEnum" AS ENUM ('None', 'HR', 'IT', 'Sales', 'Marketing', 'Finance', 'Operations', 'Legal', 'Admin');

-- AlterTable
ALTER TABLE "User" DROP COLUMN "name",
ADD COLUMN     "department" "DepartmentEnum" NOT NULL DEFAULT 'None',
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "role" "UserRoleEnum" NOT NULL DEFAULT 'User',
ADD COLUMN     "status" "UserStatusEnum" NOT NULL DEFAULT 'Active';
