package com.f1champions.app.di

import android.content.Context
import androidx.room.Room
import com.f1champions.app.BuildConfig
import com.f1champions.app.data.api.F1ApiService
import com.f1champions.app.data.local.F1Database
import com.f1champions.app.data.local.dao.RaceDao
import com.f1champions.app.data.local.dao.SeasonDao
import com.f1champions.app.data.network.NetworkConnectivityChecker
import com.f1champions.app.data.repository.F1RepositoryImpl
import com.f1champions.app.domain.repository.F1Repository
import com.squareup.moshi.Moshi
import com.squareup.moshi.kotlin.reflect.KotlinJsonAdapterFactory
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.moshi.MoshiConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideOkHttpClient(): OkHttpClient {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        return OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()
    }

    @Provides
    @Singleton
    fun provideMoshi(): Moshi {
        return Moshi.Builder()
            .add(KotlinJsonAdapterFactory())
            .build()
    }

    @Provides
    @Singleton
    fun provideRetrofit(okHttpClient: OkHttpClient, moshi: Moshi): Retrofit {
        return Retrofit.Builder()
            .baseUrl(BuildConfig.BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(MoshiConverterFactory.create(moshi))
            .build()
    }

    @Provides
    @Singleton
    fun provideF1ApiService(retrofit: Retrofit): F1ApiService {
        return retrofit.create(F1ApiService::class.java)
    }

    @Provides
    @Singleton
    fun provideF1Database(@ApplicationContext context: Context): F1Database {
        return Room.databaseBuilder(
            context,
            F1Database::class.java,
            F1Database.DATABASE_NAME
        ).build()
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
    fun provideNetworkConnectivityChecker(@ApplicationContext context: Context): NetworkConnectivityChecker {
        return NetworkConnectivityChecker(context)
    }

    @Provides
    @Singleton
    fun provideF1Repository(
        f1ApiService: F1ApiService,
        seasonDao: SeasonDao,
        raceDao: RaceDao,
        networkChecker: NetworkConnectivityChecker
    ): F1Repository {
        return F1RepositoryImpl(f1ApiService, seasonDao, raceDao, networkChecker)
    }
} 