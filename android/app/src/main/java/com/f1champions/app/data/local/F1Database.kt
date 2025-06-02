package com.f1champions.app.data.local

import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import android.content.Context
import com.f1champions.app.data.local.dao.RaceDao
import com.f1champions.app.data.local.dao.SeasonDao
import com.f1champions.app.data.local.entity.RaceEntity
import com.f1champions.app.data.local.entity.SeasonEntity

@Database(
    entities = [SeasonEntity::class, RaceEntity::class],
    version = 1,
    exportSchema = false
)
abstract class F1Database : RoomDatabase() {
    
    abstract fun seasonDao(): SeasonDao
    abstract fun raceDao(): RaceDao
    
    companion object {
        const val DATABASE_NAME = "f1_champions_database"
    }
} 