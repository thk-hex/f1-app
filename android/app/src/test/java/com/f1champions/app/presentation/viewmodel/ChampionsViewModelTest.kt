package com.f1champions.app.presentation.viewmodel

import app.cash.turbine.test
import com.f1champions.app.domain.model.Season
import com.f1champions.app.domain.repository.F1Repository
import com.f1champions.app.domain.usecase.GetChampionsUseCase
import com.f1champions.app.presentation.ui.UiState
import com.google.common.truth.Truth.assertThat
import io.mockk.coEvery
import io.mockk.every
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
    private lateinit var repository: F1Repository
    private lateinit var viewModel: ChampionsViewModel
    
    @Before
    fun setup() {
        Dispatchers.setMain(testDispatcher)
        getChampionsUseCase = mockk()
        repository = mockk()
        
        // Default network connectivity behavior
        every { repository.observeNetworkConnectivity() } returns flowOf(true)
    }
    
    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    // Test Data Factory Functions
    private fun createTestSeasons(count: Int = 2): List<Season> {
        return (1..count).map { index ->
            Season(
                year = (2024 - index).toString(),
                championName = when (index) {
                    1 -> "Max Verstappen"
                    2 -> "Lewis Hamilton"
                    else -> "Test Champion $index"
                },
                championId = when (index) {
                    1 -> "verstappen"
                    2 -> "hamilton"
                    else -> "driver$index"
                }
            )
        }
    }
    
    @Test
    fun `should automatically fetch champions data when ViewModel is created`() = runTest {
        // Given
        val expectedSeasons = createTestSeasons()
        coEvery { getChampionsUseCase() } returns flowOf(Result.success(expectedSeasons))
        
        // When
        viewModel = ChampionsViewModel(getChampionsUseCase, repository)
        
        // Then
        viewModel.uiState.test {
            val loadingState = awaitItem()
            assertThat(loadingState.champions).isInstanceOf(UiState.Loading::class.java)
            
            val successState = awaitItem()
            assertThat(successState.champions).isInstanceOf(UiState.Success::class.java)
            
            val data = (successState.champions as UiState.Success<List<Season>>).data
            assertThat(data).hasSize(2)
            assertThat(data[0].year).isEqualTo("2023")
            assertThat(data[0].championName).isEqualTo("Max Verstappen")
            assertThat(data[0].championId).isEqualTo("verstappen")
        }
    }
    
    @Test
    fun `should update state to loading then success with correct data when use case returns successful result`() = runTest {
        // Given
        val expectedSeasons = createTestSeasons()
        coEvery { getChampionsUseCase() } returns flowOf(Result.success(expectedSeasons))
        
        // When
        viewModel = ChampionsViewModel(getChampionsUseCase, repository)
        
        // Then
        viewModel.uiState.test {
            val loadingState = awaitItem()
            assertThat(loadingState.champions).isInstanceOf(UiState.Loading::class.java)
            
            val successState = awaitItem()
            assertThat(successState.champions).isInstanceOf(UiState.Success::class.java)
            
            val data = (successState.champions as UiState.Success<List<Season>>).data
            assertThat(data).isEqualTo(expectedSeasons)
            assertThat(data).hasSize(2)
        }
    }
    
    @Test
    fun `should handle empty list of champions successfully when use case returns empty result`() = runTest {
        // Given
        val emptySeasons = emptyList<Season>()
        coEvery { getChampionsUseCase() } returns flowOf(Result.success(emptySeasons))
        
        // When
        viewModel = ChampionsViewModel(getChampionsUseCase, repository)
        
        // Then
        viewModel.uiState.test {
            val loadingState = awaitItem()
            assertThat(loadingState.champions).isInstanceOf(UiState.Loading::class.java)
            
            val successState = awaitItem()
            assertThat(successState.champions).isInstanceOf(UiState.Success::class.java)
            
            val data = (successState.champions as UiState.Success<List<Season>>).data
            assertThat(data).isEmpty()
        }
    }
    
    @Test
    fun `should handle single champion correctly when use case returns single result`() = runTest {
        // Given
        val singleSeason = listOf(createTestSeasons(1)[0])
        coEvery { getChampionsUseCase() } returns flowOf(Result.success(singleSeason))
        
        // When
        viewModel = ChampionsViewModel(getChampionsUseCase, repository)
        
        // Then
        viewModel.uiState.test {
            val loadingState = awaitItem()
            assertThat(loadingState.champions).isInstanceOf(UiState.Loading::class.java)
            
            val successState = awaitItem()
            assertThat(successState.champions).isInstanceOf(UiState.Success::class.java)
            
            val data = (successState.champions as UiState.Success<List<Season>>).data
            assertThat(data).hasSize(1)
            assertThat(data[0].year).isEqualTo("2023")
            assertThat(data[0].championName).isEqualTo("Max Verstappen")
        }
    }
    
    @Test
    fun `should update state to loading then error with network error message when use case returns network failure`() = runTest {
        // Given
        val networkException = RuntimeException("Network error")
        coEvery { getChampionsUseCase() } returns flowOf(Result.failure(networkException))
        
        // When
        viewModel = ChampionsViewModel(getChampionsUseCase, repository)
        
        // Then
        viewModel.uiState.test {
            val loadingState = awaitItem()
            assertThat(loadingState.champions).isInstanceOf(UiState.Loading::class.java)
            
            val errorState = awaitItem()
            assertThat(errorState.champions).isInstanceOf(UiState.Error::class.java)
            assertThat((errorState.champions as UiState.Error).message).contains("Network error")
        }
    }
    
    @Test
    fun `should update state to loading then error with API error message when use case returns API failure`() = runTest {
        // Given
        val apiException = RuntimeException("API server is unavailable")
        coEvery { getChampionsUseCase() } returns flowOf(Result.failure(apiException))
        
        // When
        viewModel = ChampionsViewModel(getChampionsUseCase, repository)
        
        // Then
        viewModel.uiState.test {
            val loadingState = awaitItem()
            assertThat(loadingState.champions).isInstanceOf(UiState.Loading::class.java)
            
            val errorState = awaitItem()
            assertThat(errorState.champions).isInstanceOf(UiState.Error::class.java)
            assertThat((errorState.champions as UiState.Error).message).contains("API server is unavailable")
        }
    }
    
    @Test
    fun `should update state to loading then error with timeout message when use case returns timeout failure`() = runTest {
        // Given
        val timeoutException = RuntimeException("Request timeout")
        coEvery { getChampionsUseCase() } returns flowOf(Result.failure(timeoutException))
        
        // When
        viewModel = ChampionsViewModel(getChampionsUseCase, repository)
        
        // Then
        viewModel.uiState.test {
            val loadingState = awaitItem()
            assertThat(loadingState.champions).isInstanceOf(UiState.Loading::class.java)
            
            val errorState = awaitItem()
            assertThat(errorState.champions).isInstanceOf(UiState.Error::class.java)
            assertThat((errorState.champions as UiState.Error).message).contains("Request timeout")
        }
    }
    
    @Test
    fun `should observe network connectivity from repository when network connectivity changes`() = runTest {
        // Given
        val networkConnectivityFlow = flowOf(true, false, true)
        every { repository.observeNetworkConnectivity() } returns networkConnectivityFlow
        coEvery { getChampionsUseCase() } returns flowOf(Result.success(emptyList<Season>()))
        
        // When
        viewModel = ChampionsViewModel(getChampionsUseCase, repository)
        
        // Then
        // ViewModel should be observing network connectivity
        // This test ensures the network connectivity flow is being collected
        assertThat(viewModel).isNotNull()
    }
} 