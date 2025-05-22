package com.f1champions.app.presentation.ui

import com.f1champions.app.domain.model.Race
import com.f1champions.app.domain.model.Season

sealed class UiState<out T> {
    object Loading : UiState<Nothing>()
    data class Success<T>(val data: T) : UiState<T>()
    data class Error(val message: String) : UiState<Nothing>()
}

data class ChampionsUiState(
    val champions: UiState<List<Season>> = UiState.Loading
)

data class RaceWinnersUiState(
    val season: String = "",
    val championId: String = "",
    val raceWinners: UiState<List<Race>> = UiState.Loading
) 