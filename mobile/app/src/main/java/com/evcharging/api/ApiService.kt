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
    @GET("EVOwner")
    suspend fun getAllEVOwners(): Response<List<EVOwner>>

    /**
     * Get EV owner by NIC
     * @param nic National Identity Card number
     * @return Response containing EV owner details
     */
    @GET("EVOwner/{nic}")
    suspend fun getEVOwnerByNIC(@Path("nic") nic: String): Response<EVOwner>

    /**
     * Create new EV owner profile
     * @param owner EV owner data
     * @return Response containing created EV owner
     */
    @POST("EVOwner")
    suspend fun createEVOwner(@Body owner: EVOwner): Response<EVOwnerResponse>

    /**
     * Update EV owner profile
     * @param nic National Identity Card number
     * @param owner Updated EV owner data
     * @return Response with status message
     */
    @PUT("EVOwner/{nic}")
    suspend fun updateEVOwner(
        @Path("nic") nic: String,
        @Body owner: EVOwner
    ): Response<MessageResponse>

    /**
     * Activate EV owner account
     * @param nic National Identity Card number
     * @return Response with status message
     */
    @PUT("EVOwner/{nic}/activate")
    suspend fun activateEVOwner(@Path("nic") nic: String): Response<MessageResponse>

    /**
     * Deactivate EV owner account
     * @param nic National Identity Card number
     * @return Response with status message
     */
    @PUT("EVOwner/{nic}/deactivate")
    suspend fun deactivateEVOwner(@Path("nic") nic: String): Response<MessageResponse>

    /**
     * Toggle EV owner status (activate/deactivate)
     * @return Response with status message
     */
    @PATCH("EVOwner/{nic}/status")
    suspend fun toggleEVOwnerStatus(
        @Path("nic") nic: String,
        @Body request: UpdateStatusRequest
    ): Response<MessageResponse>

    /**
     * Delete EV owner profile
     * @param nic National Identity Card number
     * @return Response with status message
     */
    @DELETE("EVOwner/{nic}")
    suspend fun deleteEVOwner(@Path("nic") nic: String): Response<MessageResponse>

    /**
     * Login with email and password
     * @param request Login credentials
     * @return Response containing user data and token
     */
    @POST("Auth/login")
    suspend fun login(@Body request: LoginRequest): Response<LoginResponse>

    /**
     * Register new user account
     * @param request Registration data
     * @return Response containing created user
     */
    @POST("Auth/register")
    suspend fun register(@Body request: RegisterRequest): Response<EVOwnerResponse>

    /**
     * Send password reset email
     * @param request Email for password reset
     * @return Response with status message
     */
    @POST("Auth/forgot-password")
    suspend fun forgotPassword(@Body request: ForgotPasswordRequest): Response<ForgotPasswordResponse>

    /**
     * Verify authentication token
     * @param token Authentication token
     * @return Response with validation result
     */
    @GET("Auth/verify")
    suspend fun verifyToken(@Header("Authorization") token: String): Response<MessageResponse>

    /**
     * Logout user (optional - if backend supports it)
     * @return Response with status message
     */
    @POST("Auth/logout")
    suspend fun logout(): Response<MessageResponse>
}