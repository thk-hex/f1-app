package com.f1champions.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.f1champions.app.data.local.entity.SeasonEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface SeasonDao {
    
    @Query("SELECT * FROM seasons ORDER BY year DESC")
    fun getAllSeasons(): Flow<List<SeasonEntity>>
    
    @Query("SELECT * FROM seasons WHERE year = :year")
    suspend fun getSeasonByYear(year: String): SeasonEntity?
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSeasons(seasons: List<SeasonEntity>)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertSeason(season: SeasonEntity)
    
    @Query("DELETE FROM seasons")
    suspend fun deleteAllSeasons()
    
    @Query("SELECT COUNT(*) FROM seasons")
    suspend fun getSeasonsCount(): Int
} 