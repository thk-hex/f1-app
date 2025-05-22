package com.f1champions.app.data.api

import com.f1champions.app.data.model.RaceDto
import com.f1champions.app.data.model.SeasonDto
import retrofit2.http.GET
import retrofit2.http.Path

interface F1ApiService {
    
    @GET("/champions")
    suspend fun getChampions(): List<SeasonDto>
    
    @GET("/race-winners/{year}")
    suspend fun getRaceWinners(@Path("year") year: String): List<RaceDto>
} 