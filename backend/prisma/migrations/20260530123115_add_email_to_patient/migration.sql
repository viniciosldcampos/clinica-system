/*
  Warnings:

  - A unique constraint covering the columns `[email]` on the table `patients` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "patients" ADD COLUMN     "email" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "patients_email_key" ON "patients"("email");
