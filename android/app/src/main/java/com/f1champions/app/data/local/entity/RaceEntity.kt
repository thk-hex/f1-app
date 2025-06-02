package com.f1champions.app.data.local.entity

import androidx.room.ColumnInfo
import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "races")
data class RaceEntity(
    @PrimaryKey
    @ColumnInfo(name = "id")
    val id: String,
    
    @ColumnInfo(name = "year")
    val year: String,
    
    @ColumnInfo(name = "round")
    val round: String,
    
    @ColumnInfo(name = "grand_prix_name")
    val grandPrixName: String,
    
    @ColumnInfo(name = "winner_name")
    val winnerName: String,
    
    @ColumnInfo(name = "winner_id")
    val winnerId: String,
    
    @ColumnInfo(name = "last_updated")
    val lastUpdated: Long = System.currentTimeMillis()
) 