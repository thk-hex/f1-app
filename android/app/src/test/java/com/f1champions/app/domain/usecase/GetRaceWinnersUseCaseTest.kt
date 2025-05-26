package com.f1champions.app.domain.usecase

import app.cash.turbine.test
import com.f1champions.app.domain.model.Race
import com.f1champions.app.domain.repository.F1Repository
import com.google.common.truth.Truth.assertThat
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test

class GetRaceWinnersUseCaseTest {
    
    private lateinit var repository: F1Repository
    private lateinit var useCase: GetRaceWinnersUseCase
    
    @Before
    fun setup() {
        repository = mockk()
        useCase = GetRaceWinnersUseCase(repository)
    }
    
    @Test
    fun `invoke should return race data from repository for given year`() = runTest {
        // Given
        val year = "2023"
        val races = listOf(
            Race("6", "Monaco GP", "Max Verstappen", "verstappen"),
            Race("10", "British GP", "Lewis Hamilton", "hamilton")
        )
        every { repository.getRaceWinners(year) } returns flowOf(Result.success(races))
        
        // When/Then
        useCase(year).test {
            val result = awaitItem()
            assertThat(result.isSuccess).isTrue()
            
            val raceData = result.getOrNull()!!
            assertThat(raceData).hasSize(2)
            assertThat(raceData[0].round).isEqualTo("6")
            assertThat(raceData[0].grandPrixName).isEqualTo("Monaco GP")
            assertThat(raceData[0].winnerName).isEqualTo("Max Verstappen")
            assertThat(raceData[0].winnerId).isEqualTo("verstappen")
            
            awaitComplete()
        }
        
        // Verify the repository was called with the correct year
        verify { repository.getRaceWinners(year) }
    }
    
    @Test
    fun `invoke should return error when repository fails`() = runTest {
        // Given
        val year = "2023"
        val exception = RuntimeException("Server error")
        every { repository.getRaceWinners(year) } returns flowOf(Result.failure(exception))
        
        // When/Then
        useCase(year).test {
            val result = awaitItem()
            assertThat(result.isFailure).isTrue()
            assertThat(result.exceptionOrNull()?.message).isEqualTo("Server error")
            awaitComplete()
        }
        
        // Verify the repository was called with the correct year
        verify { repository.getRaceWinners(year) }
    }
} 