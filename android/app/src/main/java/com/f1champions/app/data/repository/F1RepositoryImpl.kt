package com.f1champions.app.data.repository

import com.f1champions.app.data.api.F1ApiService
import com.f1champions.app.data.model.RaceDto
import com.f1champions.app.data.model.SeasonDto
import com.f1champions.app.domain.model.Race
import com.f1champions.app.domain.model.Season
import com.f1champions.app.domain.repository.F1Repository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class F1RepositoryImpl @Inject constructor(
    private val apiService: F1ApiService
) : F1Repository {

    override fun getChampions(): Flow<Result<List<Season>>> = flow {
        try {
            val response = apiService.getChampions()
            emit(Result.success(response.map { it.toDomainModel() }))
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }

    override fun getRaceWinners(year: String): Flow<Result<List<Race>>> = flow {
        try {
            val response = apiService.getRaceWinners(year)
            emit(Result.success(response.map { it.toDomainModel() }))
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }

    private fun SeasonDto.toDomainModel(): Season {
        return Season(
            year = season,
            championName = "$givenName $familyName",
            championId = driverId
        )
    }

    private fun RaceDto.toDomainModel(): Race {
        return Race(
            round = round,
            grandPrixName = gpName,
            winnerName = "$winnerGivenName $winnerFamilyName",
            winnerId = winnerId
        )
    }
} 