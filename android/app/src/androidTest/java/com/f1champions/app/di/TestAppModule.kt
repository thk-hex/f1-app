package com.f1champions.app.di

import android.content.Context
import androidx.room.Room
import com.f1champions.app.data.api.F1ApiService
import com.f1champions.app.data.local.F1Database
import com.f1champions.app.data.local.dao.RaceDao
import com.f1champions.app.data.local.dao.SeasonDao
import com.f1champions.app.data.network.NetworkConnectivityChecker
import com.f1champions.app.data.repository.F1RepositoryImpl
import com.f1champions.app.domain.model.Race
import com.f1champions.app.domain.model.Season
import com.f1champions.app.domain.repository.F1Repository
import dagger.Module
import dagger.Provides
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import dagger.hilt.testing.TestInstallIn
import io.mockk.coEvery
import io.mockk.every
import io.mockk.mockk
import kotlinx.coroutines.flow.flowOf
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

    @Provides
    @Singleton
    fun provideTestDatabase(@ApplicationContext context: Context): F1Database {
        return Room.inMemoryDatabaseBuilder(
            context,
            F1Database::class.java
        ).allowMainThreadQueries().build()
    }

    @Provides
    fun provideSeasonDao(database: F1Database): SeasonDao {
        return database.seasonDao()
    }

    @Provides
    fun provideRaceDao(database: F1Database): RaceDao {
        return database.raceDao()
    }

    @Provides
    @Singleton
    fun provideNetworkConnectivityChecker(): NetworkConnectivityChecker {
        val mockChecker = mockk<NetworkConnectivityChecker>()
        every { mockChecker.isNetworkAvailable() } returns true
        every { mockChecker.observeNetworkConnectivity() } returns flowOf(true)
        return mockChecker
    }
    
    // For integration tests, we use the real repository implementation with mock API
    @Provides
    @Singleton
    fun provideF1Repository(
        apiService: F1ApiService,
        seasonDao: SeasonDao,
        raceDao: RaceDao,
        networkChecker: NetworkConnectivityChecker
    ): F1Repository {
        return F1RepositoryImpl(apiService, seasonDao, raceDao, networkChecker)
    }
} 