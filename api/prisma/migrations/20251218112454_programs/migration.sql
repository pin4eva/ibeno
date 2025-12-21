-- CreateTable
CREATE TABLE "programs" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "bannerImage" TEXT,
    "category" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "programs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "application_sessions" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "application_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "applications" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "applicationNo" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "dob" TIMESTAMP(3),
    "gender" TEXT,
    "school" TEXT,
    "faculty" TEXT,
    "department" TEXT,
    "regNo" TEXT,
    "level" INTEGER,
    "programDuration" INTEGER,
    "state" TEXT,
    "lga" TEXT,
    "village" TEXT,
    "address" TEXT,
    "ekpuk" TEXT,
    "phone" TEXT NOT NULL,
    "bankName" TEXT,
    "accountNo" TEXT,
    "nin" TEXT NOT NULL,
    "passport" TEXT,
    "examsType" TEXT,
    "nameOfSchool" TEXT,
    "subjectGrade" TEXT,
    "year" TEXT,
    "admissionLetter" TEXT,
    "lastSchoolFeeReciept" TEXT,
    "status" TEXT NOT NULL DEFAULT 'In Progress',
    "type" TEXT,
    "applicationSessionId" INTEGER NOT NULL,
    "schoolIdCard" TEXT,
    "certificateOfOrigin" TEXT,
    "ssceResult" TEXT,
    "birthCertificate" TEXT,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "applications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "programs_name_key" ON "programs"("name");

-- CreateIndex
CREATE UNIQUE INDEX "application_sessions_name_key" ON "application_sessions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "applications_email_key" ON "applications"("email");

-- CreateIndex
CREATE UNIQUE INDEX "applications_applicationNo_key" ON "applications"("applicationNo");

-- CreateIndex
CREATE UNIQUE INDEX "applications_regNo_key" ON "applications"("regNo");

-- CreateIndex
CREATE UNIQUE INDEX "applications_phone_key" ON "applications"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "applications_nin_key" ON "applications"("nin");
