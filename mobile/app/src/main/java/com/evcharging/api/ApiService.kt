package com.evcharging.api

import com.evcharging.models.*
import retrofit2.Response
import retrofit2.http.*

interface ApiService {

    // ============ BOOKING ENDPOINTS ============

    /**
     * Get all bookings from the server
     * @return Response containing list of all bookings
     */
    @GET("Booking")
    suspend fun getAllBookings(): Response<List<Booking>>

    /**
     * Get booking by ID
     * @param id Booking ID
     * @return Response containing booking details
     */
    @GET("Booking/{id}")
    suspend fun getBookingById(@Path("id") id: String): Response<Booking>

    /**
     * Get bookings by station ID
     * @param stationId Station ID
     * @return Response containing list of bookings for the station
     */
    @GET("Booking/station/{stationId}")
    suspend fun getBookingsByStation(@Path("stationId") stationId: String): Response<List<Booking>>

    /**
     * Get bookings by status
     * @param status Booking status (Pending, Approved, Completed, etc.)
     * @return Response containing list of bookings with the specified status
     */
    @GET("Booking/status/{status}")
    suspend fun getBookingsByStatus(@Path("status") status: String): Response<List<Booking>>

    /**
     * Check slot availability for booking
     * @param stationId Station ID
     * @param reservationDate Reservation date
     * @param startTime Start time in HH:MM:SS format
     * @param endTime End time in HH:MM:SS format
     * @param chargerType Charger type (AC or DC)
     * @return Response containing list of available slots
     */
    @GET("Booking/availability")
    suspend fun checkAvailability(
        @Query("stationId") stationId: String,
        @Query("reservationDate") reservationDate: String,
        @Query("startTime") startTime: String,
        @Query("endTime") endTime: String,
        @Query("chargerType") chargerType: String
    ): Response<List<Slot>>

    /**
     * Create a new booking
     * @param request Booking creation request
     * @return Response containing created booking
     */
    @POST("Booking/create")
    suspend fun createBooking(@Body request: CreateBookingRequest): Response<BookingResponse>

    /**
     * Update existing booking
     * @param id Booking ID
     * @param request Booking update request
     * @return Response with status message
     */
    @PUT("Booking/{id}/update")
    suspend fun updateBooking(
        @Path("id") id: String,
        @Body request: UpdateBookingRequest
    ): Response<MessageResponse>

    /**
     * Cancel booking
     * @param id Booking ID
     * @param request Cancellation request with reason
     * @return Response with status message
     */
    @POST("Booking/{id}/cancel")
    suspend fun cancelBooking(
        @Path("id") id: String,
        @Body request: CancelBookingRequest
    ): Response<MessageResponse>

    /**
     * Update booking status
     * @param id Booking ID
     * @param request Status update request
     * @return Response with status message
     */
    @PATCH("Booking/{id}/status")
    suspend fun updateBookingStatus(
        @Path("id") id: String,
        @Body request: UpdateStatusRequest
    ): Response<MessageResponse>

    /**
     * Scan QR code for booking
     * @param id Booking ID
     * @return Response with status message
     */
    @POST("Booking/{id}/scan-qr")
    suspend fun scanQRCode(@Path("id") id: String): Response<MessageResponse>

    /**
     * Update energy consumed and cost
     * @param id Booking ID
     * @param request Energy and cost update request
     * @return Response with status message
     */
    @PATCH("Booking/{id}/energy-cost")
    suspend fun updateEnergyAndCost(
        @Path("id") id: String,
        @Body request: UpdateEnergyCostRequest
    ): Response<MessageResponse>

    /**
     * Get charging rate for a booking
     * @param id Booking ID
     * @return Response containing charging rate information
     */
    @GET("Booking/{id}/charging-rate")
    suspend fun getChargingRate(@Path("id") id: String): Response<ChargingRateResponse>

    // ============ STATION ENDPOINTS ============

    /**
     * Get all charging stations
     * @return Response containing list of all stations
     */
    @GET("Station")
    suspend fun getAllStations(): Response<List<Station>>

    /**
     * Get station by ID
     * @param id Station ID
     * @return Response containing station details
     */
    @GET("Station/{id}")
    suspend fun getStationById(@Path("id") id: String): Response<Station>

    /**
     * Get all station details including slots and schedules
     * @param id Station ID
     * @return Response containing complete station information
     */
    @GET("Station/all/{id}")
    suspend fun getStationAllDetails(@Path("id") id: String): Response<StationDetails>

    // ============ EV OWNER ENDPOINTS ============

    /**
     * Get all EV owners
     * @return Response containing list of all EV owners
     */
    @GET("api/EVOwner")
    suspend fun getAllEVOwners(): Response<List<EVOwner>>

    /**
     * Get EV owner by NIC
     * @param nic National Identity Card number
     * @return Response containing EV owner details
     */
    @GET("api/EVOwner/{nic}")
    suspend fun getEVOwnerByNIC(@Path("nic") nic: String): Response<EVOwner>

    /**
     * Create new EV owner profile
     * @param request Create EV owner request DTO
     * @return Response containing created EV owner
     */
    @POST("api/EVOwner")
    suspend fun createEVOwner(@Body request: CreateEVOwnerRequest): Response<EVOwner>

    /**
     * Update EV owner profile - UPDATED to use UpdateEVOwnerRequest
     * @param nic National Identity Card number
     * @param request Updated EV owner data
     * @return Response with status message
     */
    @PUT("api/EVOwner/{nic}")
    suspend fun updateEVOwner(
        @Path("nic") nic: String,
        @Body request: UpdateEVOwnerRequest
    ): Response<MessageResponse>

    /**
     * DELETE EV owner account permanently
     * @param nic National Identity Card number
     * @return Response with status message
     */
    @DELETE("api/EVOwner/{nic}")
    suspend fun deleteEVOwner(@Path("nic") nic: String): Response<MessageResponse>

    /**
     * Activate EV owner account
     * @param nic National Identity Card number
     * @return Response with status message
     */
    @PATCH("api/EVOwner/{nic}/activate")
    suspend fun activateEVOwner(@Path("nic") nic: String): Response<MessageResponse>

    /**
     * Deactivate EV owner account
     * @param nic National Identity Card number
     * @return Response with status message
     */
    @PATCH("api/EVOwner/{nic}/deactivate")
    suspend fun deactivateEVOwner(@Path("nic") nic: String): Response<MessageResponse>

    @GET("api/EVOwner/active")
    suspend fun getActiveEVOwners(): Response<List<EVOwner>>

    @GET("api/EVOwner/inactive")
    suspend fun getInactiveEVOwners(): Response<List<EVOwner>>

    @GET("api/EVOwner/search")
    suspend fun searchEVOwners(@Query("searchTerm") searchTerm: String): Response<List<EVOwner>>

    @PATCH("api/EVOwner/{nic}/change-password-mobile")
    suspend fun changePasswordMobile(
        @Path("nic") nic: String,
        @Body request: ChangePasswordRequest
    ): Response<MessageResponse>
}