package com.f1champions.app.presentation.viewmodel

import androidx.lifecycle.SavedStateHandle
import app.cash.turbine.test
import com.f1champions.app.domain.model.Race
import com.f1champions.app.domain.usecase.GetRaceWinnersUseCase
import com.f1champions.app.presentation.ui.UiState
import com.google.common.truth.Truth.assertThat
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Before
import org.junit.Test

@ExperimentalCoroutinesApi
class RaceWinnersViewModelTest {
    
    private val testDispatcher = StandardTestDispatcher()
    private lateinit var getRaceWinnersUseCase: GetRaceWinnersUseCase
    private lateinit var savedStateHandle: SavedStateHandle
    private lateinit var viewModel: RaceWinnersViewModel
    
    private val testSeason = "2023"
    private val testChampionId = "verstappen"
    
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        getRaceWinnersUseCase = mockk()
        savedStateHandle = SavedStateHandle().apply {
            set("season", testSeason)
            set("championId", testChampionId)
        }
    }
    
    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }
    
    @Test
    fun `fetchRaceWinners should update state to loading then success when usecase returns success`() = runTest {
        // Given
        val races = listOf(
            Race("Monaco GP", "Max Verstappen", "verstappen"),
            Race("British GP", "Lewis Hamilton", "hamilton")
        )
        coEvery { getRaceWinnersUseCase(testSeason) } returns flowOf(Result.success(races))
        
        // When
        viewModel = RaceWinnersViewModel(getRaceWinnersUseCase, savedStateHandle)
        
        // Then
        viewModel.uiState.test {
            val loading = awaitItem()
            assertThat(loading.raceWinners).isInstanceOf(UiState.Loading::class.java)
            assertThat(loading.season).isEqualTo(testSeason)
            assertThat(loading.championId).isEqualTo(testChampionId)
            
            val success = awaitItem()
            assertThat(success.raceWinners).isInstanceOf(UiState.Success::class.java)
            val data = (success.raceWinners as UiState.Success<List<Race>>).data
            assertThat(data).hasSize(2)
            assertThat(data[0].grandPrixName).isEqualTo("Monaco GP")
            assertThat(data[0].winnerName).isEqualTo("Max Verstappen")
        }
    }
    
    @Test
    fun `fetchRaceWinners should update state to loading then error when usecase returns failure`() = runTest {
        // Given
        val exception = RuntimeException("Network error")
        coEvery { getRaceWinnersUseCase(testSeason) } returns flowOf(Result.failure(exception))
        
        // When
        viewModel = RaceWinnersViewModel(getRaceWinnersUseCase, savedStateHandle)
        
        // Then
        viewModel.uiState.test {
            val loading = awaitItem()
            assertThat(loading.raceWinners).isInstanceOf(UiState.Loading::class.java)
            
            val error = awaitItem()
            assertThat(error.raceWinners).isInstanceOf(UiState.Error::class.java)
            assertThat((error.raceWinners as UiState.Error).message).contains("Network error")
        }
    }
} 