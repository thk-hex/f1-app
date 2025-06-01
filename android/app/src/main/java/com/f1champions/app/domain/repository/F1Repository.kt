package com.f1champions.app.domain.repository

import com.f1champions.app.domain.model.Race
import com.f1champions.app.domain.model.Season
import kotlinx.coroutines.flow.Flow

interface F1Repository {
    fun getChampions(): Flow<Result<List<Season>>>
    fun getRaceWinners(year: String): Flow<Result<List<Race>>>
} 