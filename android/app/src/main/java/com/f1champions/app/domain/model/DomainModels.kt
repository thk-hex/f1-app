package com.f1champions.app.domain.model

data class Season(
    val year: String,
    val championName: String,
    val championId: String
)

data class Race(
    val grandPrixName: String,
    val winnerName: String,
    val winnerId: String
) 