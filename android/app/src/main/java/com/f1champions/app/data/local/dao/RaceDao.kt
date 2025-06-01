package com.f1champions.app.data.local.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.f1champions.app.data.local.entity.RaceEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface RaceDao {
    
    @Query("SELECT * FROM races WHERE year = :year ORDER BY CAST(round AS INTEGER)")
    fun getRacesByYear(year: String): Flow<List<RaceEntity>>
    
    @Query("SELECT * FROM races WHERE year = :year ORDER BY CAST(round AS INTEGER)")
    suspend fun getRacesByYearSync(year: String): List<RaceEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRaces(races: List<RaceEntity>)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertRace(race: RaceEntity)
    
    @Query("DELETE FROM races WHERE year = :year")
    suspend fun deleteRacesByYear(year: String)
    
    @Query("DELETE FROM races")
    suspend fun deleteAllRaces()
    
    @Query("SELECT COUNT(*) FROM races WHERE year = :year")
    suspend fun getRacesCountByYear(year: String): Int
} 