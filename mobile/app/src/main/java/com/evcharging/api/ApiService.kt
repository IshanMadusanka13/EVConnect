package com.evcharging.api

import com.evcharging.models.Booking
import com.evcharging.models.Station
import retrofit2.Call
import retrofit2.http.Body
import retrofit2.http.GET
import retrofit2.http.POST
import retrofit2.http.PUT
import retrofit2.http.Path

interface ApiService {

    @POST("Booking/create")
    fun createBooking(@Body booking: Booking): Call<Booking>

    @PUT("Booking/{id}/update")
    fun updateBooking(@Path("id") id: String, @Body booking: Booking): Call<Booking>

    @POST("Booking/{id}/cancel")
    fun cancelBooking(@Path("id") id: String): Call<Void>

    @GET("Booking")
    fun getBookings(): Call<List<Booking>>

    @GET("Station")
    fun getStations(): Call<List<Station>>

    @GET("Station/{id}")
    fun getStationById(@Path("id") id: String): Call<Station>
}