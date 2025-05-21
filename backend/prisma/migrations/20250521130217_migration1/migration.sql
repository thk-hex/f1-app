-- CreateTable
CREATE TABLE "Champion" (
    "id" SERIAL NOT NULL,
    "season" TEXT NOT NULL,
    "givenName" TEXT NOT NULL,
    "familyName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Champion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Champion_season_key" ON "Champion"("season");

-- CreateIndex
CREATE INDEX "Champion_season_idx" ON "Champion"("season");
