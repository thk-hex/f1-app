package com.f1champions.app.data.repository

import com.f1champions.app.data.api.F1ApiService
import com.f1champions.app.data.local.dao.RaceDao
import com.f1champions.app.data.local.dao.SeasonDao
import com.f1champions.app.data.local.mapper.toDomainModels
import com.f1champions.app.data.local.mapper.toRaceDomainModels
import com.f1champions.app.data.local.mapper.toRaceEntities
import com.f1champions.app.data.local.mapper.toSeasonEntities
import com.f1champions.app.data.model.RaceDto
import com.f1champions.app.data.model.SeasonDto
import com.f1champions.app.data.network.NetworkConnectivityChecker
import com.f1champions.app.domain.model.Race
import com.f1champions.app.domain.model.Season
import com.f1champions.app.domain.repository.F1Repository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class F1RepositoryImpl @Inject constructor(
    private val apiService: F1ApiService,
    private val seasonDao: SeasonDao,
    private val raceDao: RaceDao,
    private val networkChecker: NetworkConnectivityChecker
) : F1Repository {

    override fun getChampions(): Flow<Result<List<Season>>> = flow {
        try {
            // First, emit cached data if available
            val cachedSeasons = seasonDao.getAllSeasons().first()
            if (cachedSeasons.isNotEmpty()) {
                emit(Result.success(cachedSeasons.toDomainModels()))
            }
            
            // Then try to fetch fresh data if network is available
            if (networkChecker.isNetworkAvailable()) {
                try {
                    val apiResponse = apiService.getChampions()
                    val domainModels = apiResponse.map { it.toDomainModel() }
                    
                    // Update cache
                    seasonDao.deleteAllSeasons()
                    seasonDao.insertSeasons(domainModels.toSeasonEntities())
                    
                    // Emit fresh data
                    emit(Result.success(domainModels))
                } catch (apiException: Exception) {
                    // If API fails but we have cached data, we already emitted it
                    // If no cached data, emit the error
                    if (cachedSeasons.isEmpty()) {
                        emit(Result.failure(apiException))
                    }
                }
            } else {
                // No network and no cached data
                if (cachedSeasons.isEmpty()) {
                    emit(Result.failure(Exception("No internet connection and no cached data available")))
                }
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }

    override fun getRaceWinners(year: String): Flow<Result<List<Race>>> = flow {
        try {
            // First, emit cached data if available
            val cachedRaces = raceDao.getRacesByYearSync(year)
            if (cachedRaces.isNotEmpty()) {
                emit(Result.success(cachedRaces.toRaceDomainModels()))
            }
            
            // Then try to fetch fresh data if network is available
            if (networkChecker.isNetworkAvailable()) {
                try {
                    val apiResponse = apiService.getRaceWinners(year)
                    val domainModels = apiResponse.map { it.toDomainModel() }
                    
                    // Update cache
                    raceDao.deleteRacesByYear(year)
                    raceDao.insertRaces(domainModels.toRaceEntities(year))
                    
                    // Emit fresh data
                    emit(Result.success(domainModels))
                } catch (apiException: Exception) {
                    // If API fails but we have cached data, we already emitted it
                    // If no cached data, emit the error
                    if (cachedRaces.isEmpty()) {
                        emit(Result.failure(apiException))
                    }
                }
            } else {
                // No network and no cached data
                if (cachedRaces.isEmpty()) {
                    emit(Result.failure(Exception("No internet connection and no cached data available")))
                }
            }
        } catch (e: Exception) {
            emit(Result.failure(e))
        }
    }

    override fun observeNetworkConnectivity(): Flow<Boolean> = networkChecker.observeNetworkConnectivity()

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