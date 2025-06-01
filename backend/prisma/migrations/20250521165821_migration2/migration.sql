-- CreateTable
CREATE TABLE "RaceWinner" (
    "id" SERIAL NOT NULL,
    "season" TEXT NOT NULL,
    "round" TEXT NOT NULL,
    "gpName" TEXT NOT NULL,
    "winnerId" TEXT NOT NULL,
    "winnerGivenName" TEXT NOT NULL,
    "winnerFamilyName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RaceWinner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "RaceWinner_season_idx" ON "RaceWinner"("season");

-- CreateIndex
CREATE UNIQUE INDEX "RaceWinner_season_round_key" ON "RaceWinner"("season", "round");
