/*
  Warnings:

  - Made the column `driverId` on table `Champion` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Champion" ALTER COLUMN "driverId" SET NOT NULL;
