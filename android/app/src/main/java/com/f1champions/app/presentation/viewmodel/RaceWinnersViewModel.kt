package com.f1champions.app.presentation.viewmodel

import androidx.lifecycle.SavedStateHandle
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.f1champions.app.domain.usecase.GetRaceWinnersUseCase
import com.f1champions.app.presentation.ui.RaceWinnersUiState
import com.f1champions.app.presentation.ui.UiState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class RaceWinnersViewModel @Inject constructor(
    private val getRaceWinnersUseCase: GetRaceWinnersUseCase,
    savedStateHandle: SavedStateHandle
) : ViewModel() {

    private val season: String = checkNotNull(savedStateHandle["season"])
    
    private val _uiState = MutableStateFlow(RaceWinnersUiState(season = season))
    val uiState: StateFlow<RaceWinnersUiState> = _uiState.asStateFlow()

    init {
        fetchRaceWinners()
    }

    fun fetchRaceWinners() {
        viewModelScope.launch {
            _uiState.value = RaceWinnersUiState(
                season = season,
                raceWinners = UiState.Loading
            )
            
            getRaceWinnersUseCase(season).collectLatest { result ->
                val newState = result.fold(
                    onSuccess = { UiState.Success(it) },
                    onFailure = { UiState.Error(it.localizedMessage ?: "Unknown error") }
                )
                
                _uiState.value = RaceWinnersUiState(
                    season = season,
                    raceWinners = newState
                )
            }
        }
    }
} 