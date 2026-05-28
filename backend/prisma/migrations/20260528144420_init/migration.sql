/*
  Warnings:

  - You are about to drop the column `appointment_time` on the `appointments` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[doctor_id,appointment_date]` on the table `appointments` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[patient_id,appointment_date]` on the table `appointments` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `appointment_date_end` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "appointments_doctor_id_appointment_date_appointment_time_key";

-- DropIndex
DROP INDEX "appointments_patient_id_appointment_date_appointment_time_key";

-- AlterTable
ALTER TABLE "appointments" DROP COLUMN "appointment_time",
ADD COLUMN     "appointment_date_end" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "cancel_reason" TEXT,
ALTER COLUMN "appointment_date" SET DATA TYPE TIMESTAMP(3),
ALTER COLUMN "duration_minutes" SET DEFAULT 20;

-- CreateIndex
CREATE UNIQUE INDEX "appointments_doctor_id_appointment_date_key" ON "appointments"("doctor_id", "appointment_date");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_patient_id_appointment_date_key" ON "appointments"("patient_id", "appointment_date");
