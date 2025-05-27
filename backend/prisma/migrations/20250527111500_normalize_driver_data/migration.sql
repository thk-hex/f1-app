-- Step 1: Create Driver table
CREATE TABLE "Driver" (
    "id" SERIAL NOT NULL,
    "driverId" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Driver_pkey" PRIMARY KEY ("id")
);

-- Create unique index on driverId
CREATE UNIQUE INDEX "Driver_driverId_key" ON "Driver"("driverId");
CREATE INDEX "Driver_driverId_idx" ON "Driver"("driverId");

-- Step 2: Populate Driver table with unique drivers from Champion table
INSERT INTO "Driver" ("driverId", "givenName", "familyName", "createdAt", "updatedAt")
SELECT DISTINCT 
    "driverId", 
    "givenName", 
    "familyName",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "Champion"
WHERE "driverId" IS NOT NULL AND "driverId" != ''
ON CONFLICT ("driverId") DO NOTHING;

-- Step 3: Populate Driver table with unique drivers from RaceWinner table that don't already exist
INSERT INTO "Driver" ("driverId", "givenName", "familyName", "createdAt", "updatedAt")
SELECT DISTINCT 
    "winnerId", 
    "winnerGivenName", 
    "winnerFamilyName",
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
FROM "RaceWinner"
WHERE "winnerId" IS NOT NULL 
    AND "winnerId" != ''
    AND "winnerId" NOT IN (SELECT "driverId" FROM "Driver")
ON CONFLICT ("driverId") DO NOTHING;

-- Step 4: Add driverId column to RaceWinner table with temporary default
ALTER TABLE "RaceWinner" ADD COLUMN "driverId" TEXT;

-- Step 5: Populate driverId in RaceWinner table
UPDATE "RaceWinner" 
SET "driverId" = "winnerId"
WHERE "winnerId" IS NOT NULL AND "winnerId" != '';

-- Step 6: Make driverId NOT NULL after population
ALTER TABLE "RaceWinner" ALTER COLUMN "driverId" SET NOT NULL;

-- Step 7: Remove redundant columns from Champion table
ALTER TABLE "Champion" DROP COLUMN "givenName";
ALTER TABLE "Champion" DROP COLUMN "familyName";

-- Step 8: Remove redundant columns from RaceWinner table
ALTER TABLE "RaceWinner" DROP COLUMN "winnerId";
ALTER TABLE "RaceWinner" DROP COLUMN "winnerGivenName";
ALTER TABLE "RaceWinner" DROP COLUMN "winnerFamilyName";

-- Step 9: Create indexes for foreign keys
CREATE INDEX "Champion_driverId_idx" ON "Champion"("driverId");
CREATE INDEX "RaceWinner_driverId_idx" ON "RaceWinner"("driverId");

-- Step 10: Add foreign key constraints
ALTER TABLE "Champion" ADD CONSTRAINT "Champion_driverId_fkey" 
    FOREIGN KEY ("driverId") REFERENCES "Driver"("driverId") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "RaceWinner" ADD CONSTRAINT "RaceWinner_driverId_fkey" 
    FOREIGN KEY ("driverId") REFERENCES "Driver"("driverId") ON DELETE RESTRICT ON UPDATE CASCADE; 