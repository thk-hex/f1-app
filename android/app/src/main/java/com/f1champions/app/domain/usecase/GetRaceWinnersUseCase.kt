package com.f1champions.app.domain.usecase

import com.f1champions.app.domain.model.Race
import com.f1champions.app.domain.repository.F1Repository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetRaceWinnersUseCase @Inject constructor(
    private val repository: F1Repository
) {
    operator fun invoke(year: String): Flow<Result<List<Race>>> {
        return repository.getRaceWinners(year)
    }
} 