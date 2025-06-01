package com.f1champions.app.presentation.viewmodel

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.f1champions.app.domain.usecase.GetChampionsUseCase
import com.f1champions.app.presentation.ui.ChampionsUiState
import com.f1champions.app.presentation.ui.UiState
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ChampionsViewModel @Inject constructor(
    private val getChampionsUseCase: GetChampionsUseCase
) : ViewModel() {

    private val _uiState = MutableStateFlow(ChampionsUiState())
    val uiState: StateFlow<ChampionsUiState> = _uiState.asStateFlow()

    init {
        fetchChampions()
    }

    fun fetchChampions() {
        viewModelScope.launch {
            _uiState.value = ChampionsUiState(UiState.Loading)
            
            getChampionsUseCase().collectLatest { result ->
                val newState = result.fold(
                    onSuccess = { UiState.Success(it) },
                    onFailure = { UiState.Error(it.localizedMessage ?: "Unknown error") }
                )
                
                _uiState.value = ChampionsUiState(newState)
            }
        }
    }
} 