package com.f1champions.app.di

import com.f1champions.app.data.api.F1ApiService
import com.f1champions.app.data.repository.F1RepositoryImpl
import com.f1champions.app.domain.model.Race
import com.f1champions.app.domain.model.Season
import com.f1champions.app.domain.repository.F1Repository
import dagger.Module
import dagger.Provides
import dagger.hilt.components.SingletonComponent
import dagger.hilt.testing.TestInstallIn
import io.mockk.coEvery
import io.mockk.mockk
import javax.inject.Singleton

@Module
@TestInstallIn(
    components = [SingletonComponent::class],
    replaces = [AppModule::class]
)
object TestAppModule {
    
    @Provides
    @Singleton
    fun provideF1ApiService(): F1ApiService {
        val mockApiService = mockk<F1ApiService>()
        
        // Mock API responses for testing
        coEvery { mockApiService.getChampions() } returns listOf(
            com.f1champions.app.data.model.SeasonDto(
                season = "2023",
                givenName = "Max",
                familyName = "Verstappen",
                driverId = "verstappen"
            ),
            com.f1champions.app.data.model.SeasonDto(
                season = "2022",
                givenName = "Max",
                familyName = "Verstappen",
                driverId = "verstappen"
            )
        )
        
        coEvery { mockApiService.getRaceWinners(any()) } returns listOf(
            com.f1champions.app.data.model.RaceDto(
                round = "6",
                gpName = "Monaco GP",
                winnerId = "verstappen",
                winnerGivenName = "Max",
                winnerFamilyName = "Verstappen"
            ),
            com.f1champions.app.data.model.RaceDto(
                round = "10",
                gpName = "British GP",
                winnerId = "hamilton",
                winnerGivenName = "Lewis",
                winnerFamilyName = "Hamilton"
            )
        )
        
        return mockApiService
    }
    
    // For integration tests, we use the real repository implementation with mock API
    @Provides
    @Singleton
    fun provideF1Repository(apiService: F1ApiService): F1Repository {
        return F1RepositoryImpl(apiService)
    }
} 