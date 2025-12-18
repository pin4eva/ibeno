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
    "programId" INTEGER NOT NULL,
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
CREATE UNIQUE INDEX "applications_applicationNo_key" ON "applications"("applicationNo");

-- CreateIndex
CREATE UNIQUE INDEX "applications_regNo_key" ON "applications"("regNo");

-- AddForeignKey
ALTER TABLE "applications" ADD CONSTRAINT "applications_programId_fkey" FOREIGN KEY ("programId") REFERENCES "programs"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
