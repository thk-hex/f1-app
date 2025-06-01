package com.f1champions.app.data.repository

import app.cash.turbine.test
import com.f1champions.app.data.api.F1ApiService
import com.f1champions.app.data.model.RaceDto
import com.f1champions.app.data.model.SeasonDto
import com.google.common.truth.Truth.assertThat
import io.mockk.coEvery
import io.mockk.mockk
import kotlinx.coroutines.test.runTest
import org.junit.Before
import org.junit.Test
import java.io.IOException

class F1RepositoryImplTest {
    
    private lateinit var apiService: F1ApiService
    private lateinit var repository: F1RepositoryImpl
    
    @Before
    fun setup() {
        apiService = mockk()
        repository = F1RepositoryImpl(apiService)
    }
    
    @Test
    fun `getChampions should return mapped domain models when API call succeeds`() = runTest {
        // Given
        val seasonDto1 = SeasonDto("2023", "Max", "Verstappen", "verstappen")
        val seasonDto2 = SeasonDto("2022", "Max", "Verstappen", "verstappen")
        val apiResponse = listOf(seasonDto1, seasonDto2)
        
        coEvery { apiService.getChampions() } returns apiResponse
        
        // When/Then
        repository.getChampions().test {
            val result = awaitItem()
            assertThat(result.isSuccess).isTrue()
            
            val seasons = result.getOrNull()!!
            assertThat(seasons).hasSize(2)
            assertThat(seasons[0].year).isEqualTo("2023")
            assertThat(seasons[0].championName).isEqualTo("Max Verstappen")
            assertThat(seasons[0].championId).isEqualTo("verstappen")
            
            awaitComplete()
        }
    }
    
    @Test
    fun `getChampions should return failure when API call fails`() = runTest {
        // Given
        val exception = IOException("Network error")
        coEvery { apiService.getChampions() } throws exception
        
        // When/Then
        repository.getChampions().test {
            val result = awaitItem()
            assertThat(result.isFailure).isTrue()
            assertThat(result.exceptionOrNull()).isInstanceOf(IOException::class.java)
            assertThat(result.exceptionOrNull()?.message).isEqualTo("Network error")
            
            awaitComplete()
        }
    }
    
    @Test
    fun `getRaceWinners should return mapped domain models when API call succeeds`() = runTest {
        // Given
        val raceDto1 = RaceDto("6", "Monaco GP", "hamilton", "Lewis", "Hamilton")
        val raceDto2 = RaceDto("10", "British GP", "verstappen", "Max", "Verstappen")
        val apiResponse = listOf(raceDto1, raceDto2)
        
        coEvery { apiService.getRaceWinners("2023") } returns apiResponse
        
        // When/Then
        repository.getRaceWinners("2023").test {
            val result = awaitItem()
            assertThat(result.isSuccess).isTrue()
            
            val races = result.getOrNull()!!
            assertThat(races).hasSize(2)
            assertThat(races[0].round).isEqualTo("6")
            assertThat(races[0].grandPrixName).isEqualTo("Monaco GP")
            assertThat(races[0].winnerName).isEqualTo("Lewis Hamilton")
            assertThat(races[0].winnerId).isEqualTo("hamilton")
            
            awaitComplete()
        }
    }
    
    @Test
    fun `getRaceWinners should return failure when API call fails`() = runTest {
        // Given
        val exception = IOException("Network error")
        coEvery { apiService.getRaceWinners("2023") } throws exception
        
        // When/Then
        repository.getRaceWinners("2023").test {
            val result = awaitItem()
            assertThat(result.isFailure).isTrue()
            assertThat(result.exceptionOrNull()).isInstanceOf(IOException::class.java)
            
            awaitComplete()
        }
    }
} 