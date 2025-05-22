package com.f1champions.app.presentation.viewmodel

import app.cash.turbine.test
import com.f1champions.app.domain.model.Season
import com.f1champions.app.domain.usecase.GetChampionsUseCase
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
class ChampionsViewModelTest {
    
    private val testDispatcher = StandardTestDispatcher()
    private lateinit var getChampionsUseCase: GetChampionsUseCase
    private lateinit var viewModel: ChampionsViewModel
    
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        getChampionsUseCase = mockk()
    }
    
    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }
    
    @Test
    fun `fetchChampions should update state to loading then success when usecase returns success`() = runTest {
        // Given
        val seasons = listOf(
            Season("2023", "Max Verstappen", "verstappen"),
            Season("2022", "Max Verstappen", "verstappen")
        )
        coEvery { getChampionsUseCase() } returns flowOf(Result.success(seasons))
        
        // When
        viewModel = ChampionsViewModel(getChampionsUseCase)
        
        // Then
        viewModel.uiState.test {
            val loading = awaitItem()
            assertThat(loading.champions).isInstanceOf(UiState.Loading::class.java)
            
            val success = awaitItem()
            assertThat(success.champions).isInstanceOf(UiState.Success::class.java)
            val data = (success.champions as UiState.Success<List<Season>>).data
            assertThat(data).hasSize(2)
            assertThat(data[0].year).isEqualTo("2023")
            assertThat(data[0].championName).isEqualTo("Max Verstappen")
        }
    }
    
    @Test
    fun `fetchChampions should update state to loading then error when usecase returns failure`() = runTest {
        // Given
        val exception = RuntimeException("Network error")
        coEvery { getChampionsUseCase() } returns flowOf(Result.failure(exception))
        
        // When
        viewModel = ChampionsViewModel(getChampionsUseCase)
        
        // Then
        viewModel.uiState.test {
            val loading = awaitItem()
            assertThat(loading.champions).isInstanceOf(UiState.Loading::class.java)
            
            val error = awaitItem()
            assertThat(error.champions).isInstanceOf(UiState.Error::class.java)
            assertThat((error.champions as UiState.Error).message).contains("Network error")
        }
    }
} 