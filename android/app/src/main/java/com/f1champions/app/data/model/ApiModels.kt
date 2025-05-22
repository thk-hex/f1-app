package com.f1champions.app.data.model

import com.squareup.moshi.Json
import com.squareup.moshi.JsonClass

@JsonClass(generateAdapter = true)
data class SeasonDto(
    @Json(name = "season") val season: String,
    @Json(name = "givenName") val givenName: String,
    @Json(name = "familyName") val familyName: String,
    @Json(name = "driverId") val driverId: String
)

@JsonClass(generateAdapter = true)
data class RaceDto(
    @Json(name = "gpName") val gpName: String,
    @Json(name = "winnerId") val winnerId: String,
    @Json(name = "winnerGivenName") val winnerGivenName: String,
    @Json(name = "winnerFamilyName") val winnerFamilyName: String
) 