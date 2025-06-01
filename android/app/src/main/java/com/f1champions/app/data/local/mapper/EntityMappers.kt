package com.f1champions.app.data.local.mapper

import com.f1champions.app.data.local.entity.RaceEntity
import com.f1champions.app.data.local.entity.SeasonEntity
import com.f1champions.app.domain.model.Race
import com.f1champions.app.domain.model.Season

// Season mappers
fun SeasonEntity.toDomainModel(): Season {
    return Season(
        year = year,
        championName = championName,
        championId = championId
    )
}

fun Season.toEntity(): SeasonEntity {
    return SeasonEntity(
        year = year,
        championName = championName,
        championId = championId
    )
}

fun List<SeasonEntity>.toDomainModels(): List<Season> {
    return map { it.toDomainModel() }
}

fun List<Season>.toSeasonEntities(): List<SeasonEntity> {
    return map { it.toEntity() }
}

// Race mappers
fun RaceEntity.toDomainModel(): Race {
    return Race(
        round = round,
        grandPrixName = grandPrixName,
        winnerName = winnerName,
        winnerId = winnerId
    )
}

fun Race.toEntity(year: String): RaceEntity {
    return RaceEntity(
        id = "${year}_$round", // Create unique ID
        year = year,
        round = round,
        grandPrixName = grandPrixName,
        winnerName = winnerName,
        winnerId = winnerId
    )
}

fun List<RaceEntity>.toRaceDomainModels(): List<Race> {
    return map { it.toDomainModel() }
}

fun List<Race>.toRaceEntities(year: String): List<RaceEntity> {
    return map { it.toEntity(year) }
} 