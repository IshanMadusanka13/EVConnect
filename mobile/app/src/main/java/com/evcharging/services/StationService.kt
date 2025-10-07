package com.evcharging.services

import com.evcharging.api.ApiService
import com.evcharging.models.Station
import retrofit2.Response

class StationService(private val apiService: ApiService) {

    suspend fun getAllStations(): Response<List<Station>> {
        return apiService.getAllStations()
    }

    suspend fun getStationById(stationId: String): Response<Station> {
        return apiService.getStationById(stationId)
    }

    suspend fun checkStationAvailability(stationId: String): Response<Int> {
        return apiService.checkStationAvailability(stationId)
    }
}