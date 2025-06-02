package com.f1champions.app.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "seasons")
data class SeasonEntity(
    @PrimaryKey
    @ColumnInfo(name = "year")
    val year: String,
    
    @ColumnInfo(name = "champion_name")
    val championName: String,
    
    @ColumnInfo(name = "champion_id")
    val championId: String,
    
    @ColumnInfo(name = "last_updated")
    val lastUpdated: Long = System.currentTimeMillis()
) 