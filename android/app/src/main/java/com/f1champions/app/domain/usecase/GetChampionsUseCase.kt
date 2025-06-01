package com.f1champions.app.domain.usecase

import com.f1champions.app.domain.model.Season
import com.f1champions.app.domain.repository.F1Repository
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetChampionsUseCase @Inject constructor(
    private val repository: F1Repository
) {
    operator fun invoke(): Flow<Result<List<Season>>> {
        return repository.getChampions()
    }
} 