/*
  Warnings:

  - You are about to drop the column `familyName` on the `Champion` table. All the data in the column will be lost.
  - You are about to drop the column `givenName` on the `Champion` table. All the data in the column will be lost.
  - You are about to drop the column `winnerFamilyName` on the `RaceWinner` table. All the data in the column will be lost.
  - You are about to drop the column `winnerGivenName` on the `RaceWinner` table. All the data in the column will be lost.
  - You are about to drop the column `winnerId` on the `RaceWinner` table. All the data in the column will be lost.
  - Added the required column `driverId` to the `RaceWinner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Champion" DROP COLUMN "familyName",
DROP COLUMN "givenName";

-- AlterTable
ALTER TABLE "RaceWinner" DROP COLUMN "winnerFamilyName",
DROP COLUMN "winnerGivenName",
DROP COLUMN "winnerId",
ADD COLUMN     "driverId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Driver" (
    "id" SERIAL NOT NULL,
    "driverId" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Driver_driverId_key" ON "Driver"("driverId");

-- CreateIndex
CREATE INDEX "Driver_driverId_idx" ON "Driver"("driverId");

-- CreateIndex
CREATE INDEX "Champion_driverId_idx" ON "Champion"("driverId");

-- CreateIndex
CREATE INDEX "RaceWinner_driverId_idx" ON "RaceWinner"("driverId");

-- AddForeignKey
ALTER TABLE "Champion" ADD CONSTRAINT "Champion_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("driverId") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RaceWinner" ADD CONSTRAINT "RaceWinner_driverId_fkey" FOREIGN KEY ("driverId") REFERENCES "Driver"("driverId") ON DELETE RESTRICT ON UPDATE CASCADE;
