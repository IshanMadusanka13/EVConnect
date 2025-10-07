package com.evcharging.services

import com.evcharging.api.ApiService
import com.evcharging.models.Booking
import retrofit2.Response

class BookingService(private val apiService: ApiService) {

    suspend fun createBooking(booking: Booking): Response<Booking> {
        return apiService.createBooking(booking)
    }

    suspend fun updateBooking(id: String, booking: Booking): Response<Booking> {
        return apiService.updateBooking(id, booking)
    }

    suspend fun cancelBooking(id: String): Response<Void> {
        return apiService.cancelBooking(id)
    }

    suspend fun getBookingById(id: String): Response<Booking> {
        return apiService.getBookingById(id)
    }

    suspend fun getAllBookings(): Response<List<Booking>> {
        return apiService.getAllBookings()
    }
}