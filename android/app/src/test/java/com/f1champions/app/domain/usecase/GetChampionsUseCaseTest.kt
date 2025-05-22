package com.f1champions.app.domain.usecase

import app.cash.turbine.test
import com.f1champions.app.domain.model.Season
import com.f1champions.app.domain.repository.F1Repository
import com.google.common.truth.Truth.assertThat
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test

class GetChampionsUseCaseTest {
    
    private lateinit var repository: F1Repository
    private lateinit var useCase: GetChampionsUseCase
    
    @Before
    fun setup() {
        repository = mockk()
        useCase = GetChampionsUseCase(repository)
    }
    
    @Test
    fun `invoke should return data from repository`() = runTest {
        // Given
        val seasons = listOf(
            Season("2023", "Max Verstappen", "verstappen"),
            Season("2022", "Max Verstappen", "verstappen")
        )
        every { repository.getChampions() } returns flowOf(Result.success(seasons))
        
        // When/Then
        useCase().test {
            val result = awaitItem()
            assertThat(result.isSuccess).isTrue()
            assertThat(result.getOrNull()).hasSize(2)
            assertThat(result.getOrNull()?.get(0)?.year).isEqualTo("2023")
            awaitComplete()
        }
    }
    
    @Test
    fun `invoke should return error when repository fails`() = runTest {
        // Given
        val exception = RuntimeException("Server error")
        every { repository.getChampions() } returns flowOf(Result.failure(exception))
        
        // When/Then
        useCase().test {
            val result = awaitItem()
            assertThat(result.isFailure).isTrue()
            assertThat(result.exceptionOrNull()?.message).isEqualTo("Server error")
            awaitComplete()
        }
    }
} 