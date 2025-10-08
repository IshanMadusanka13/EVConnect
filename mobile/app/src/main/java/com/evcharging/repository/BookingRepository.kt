package com.evcharging.repository

import android.content.Context
import android.util.Log
import com.evcharging.api.RetrofitClient
import com.evcharging.database.DatabaseHelper
import com.evcharging.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Repository class for booking operations Implements offline-first architecture with server sync
 */
class BookingRepository(private val context: Context) {

    private val apiService = RetrofitClient.apiService
    private val dbHelper = DatabaseHelper(context)

    companion object {
        private const val TAG = "BookingRepository" // Tag for logging
    }

    // ============ BOOKING OPERATIONS ============

    /** Get all bookings with offline support Fetches from server and updates local database */
    suspend fun getAllBookings(): Result<List<Booking>> =
            withContext(Dispatchers.IO) {
                try {
                    Log.d(TAG, "📡 Fetching all bookings from server...")

                    val response = apiService.getAllBookings()

                    // Log response details
                    Log.d(TAG, "Response Code: ${response.code()}")
                    Log.d(TAG, "Response Message: ${response.message()}")
                    Log.d(TAG, "Is Successful: ${response.isSuccessful}")

                    if (response.isSuccessful && response.body() != null) {
                        val bookings = response.body()!!
                        Log.d(TAG, "✅ Successfully fetched ${bookings.size} bookings from server")

                        // Log each booking
                        bookings.forEachIndexed { index, booking ->
                            Log.d(
                                    TAG,
                                    "Booking ${index + 1}: ID=${booking.id}, Status=${booking.status}, Station=${booking.stationId}"
                            )
                        }

                        // Update local database
                        syncBookingsToLocal(bookings)
                        Log.d(TAG, "💾 Synced bookings to local database")

                        Result.success(bookings)
                    } else {
                        Log.w(TAG, "⚠️ Server request failed. Falling back to local database")
                        Log.e(TAG, "Error Code: ${response.code()}")
                        Log.e(TAG, "Error Message: ${response.message()}")
                        Log.e(TAG, "Error Body: ${response.errorBody()?.string()}")

                        // Fallback to local database if server fails
                        val localBookings = getLocalBookings()
                        if (localBookings.isNotEmpty()) {
                            Log.d(
                                    TAG,
                                    "📱 Retrieved ${localBookings.size} bookings from local database"
                            )
                            Result.success(convertLocalToBookings(localBookings))
                        } else {
                            Log.e(TAG, "❌ No local bookings available")
                            Result.failure(
                                    Exception(response.message() ?: "Failed to fetch bookings")
                            )
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Exception occurred while fetching bookings", e)
                    Log.e(TAG, "Exception Type: ${e.javaClass.simpleName}")
                    Log.e(TAG, "Exception Message: ${e.message}")
                    Log.e(TAG, "Stack Trace: ${e.stackTraceToString()}")

                    // Return local data on network error
                    val localBookings = getLocalBookings()
                    if (localBookings.isNotEmpty()) {
                        Log.d(
                                TAG,
                                "📱 Returning ${localBookings.size} local bookings after exception"
                        )
                        Result.success(convertLocalToBookings(localBookings))
                    } else {
                        Log.e(TAG, "❌ No local bookings available after exception")
                        Result.failure(e)
                    }
                }
            }

    /** Get booking by ID */
    suspend fun getBookingById(id: String): Result<Booking> =
            withContext(Dispatchers.IO) {
                try {
                    Log.d(TAG, "📡 Fetching booking with ID: $id")

                    val response = apiService.getBookingById(id)

                    if (response.isSuccessful && response.body() != null) {
                        val booking = response.body()!!
                        Log.d(TAG, "✅ Successfully fetched booking: $booking")
                        Result.success(booking)
                    } else {
                        Log.e(TAG, "❌ Failed to fetch booking: ${response.message()}")
                        Result.failure(Exception(response.message() ?: "Booking not found"))
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Exception in getBookingById: ${e.message}", e)
                    Result.failure(e)
                }
            }

    /** Get bookings by status */
    suspend fun getBookingsByStatus(status: String): Result<List<Booking>> =
            withContext(Dispatchers.IO) {
                try {
                    Log.d(TAG, "📡 Fetching bookings with status: $status")

                    val response = apiService.getBookingsByStatus(status)

                    if (response.isSuccessful && response.body() != null) {
                        val bookings = response.body()!!
                        Log.d(TAG, "✅ Found ${bookings.size} bookings with status: $status")
                        Result.success(bookings)
                    } else {
                        Log.w(TAG, "⚠️ Server failed, checking local database")
                        // Fallback to local database
                        val localBookings = dbHelper.getBookingsByStatus(status)
                        Log.d(
                                TAG,
                                "📱 Found ${localBookings.size} local bookings with status: $status"
                        )
                        Result.success(convertLocalToBookings(localBookings))
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Exception in getBookingsByStatus", e)
                    // Return local data on error
                    val localBookings = dbHelper.getBookingsByStatus(status)
                    if (localBookings.isNotEmpty()) {
                        Log.d(
                                TAG,
                                "📱 Returning ${localBookings.size} local bookings after exception"
                        )
                        Result.success(convertLocalToBookings(localBookings))
                    } else {
                        Result.failure(e)
                    }
                }
            }

    /** Check slot availability */
    suspend fun checkAvailability(
            stationId: String,
            reservationDate: String,
            startTime: String,
            endTime: String,
            chargerType: String
    ): Result<List<Slot>> =
            withContext(Dispatchers.IO) {
                try {
                    Log.d(
                            TAG,
                            "📡 Checking availability for station: $stationId on $reservationDate"
                    )

                    val response =
                            apiService.checkAvailability(
                                    stationId,
                                    reservationDate,
                                    startTime,
                                    endTime,
                                    chargerType
                            )

                    if (response.isSuccessful && response.body() != null) {
                        val slots = response.body()!!
                        Log.d(TAG, "✅ Found ${slots.size} available slots")
                        Result.success(slots)
                    } else {
                        Log.e(TAG, "❌ Failed to check availability: ${response.message()}")
                        Result.failure(
                                Exception(response.message() ?: "Failed to check availability")
                        )
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Exception in checkAvailability", e)
                    Result.failure(e)
                }
            }

    /** Create new booking */
    suspend fun createBooking(request: CreateBookingRequest): Result<BookingResponse> =
            withContext(Dispatchers.IO) {
                try {
                    Log.d(TAG, "📡 Creating booking: $request")

                    val response = apiService.createBooking(request)

                    if (response.isSuccessful && response.body() != null) {
                        val bookingResponse = response.body()!!
                        Log.d(TAG, "✅ Booking created successfully: ${bookingResponse.booking.id}")

                        // Save to local database
                        val localBooking =
                                convertToLocalBooking(
                                        bookingResponse.booking,
                                        syncedWithServer = true
                                )
                        dbHelper.insertBooking(localBooking)
                        Log.d(TAG, "💾 Saved booking to local database")

                        Result.success(bookingResponse)
                    } else {
                        val errorBody = response.errorBody()?.string()
                        val errorCode = response.code()

                        Log.w(TAG, "⚠️ Server failed, saving locally")
                        Log.e(TAG, "═══════════════════════════════════════════════")
                        Log.e(TAG, "SERVER ERROR DETAILS:")
                        Log.e(TAG, "  HTTP Status Code: $errorCode")
                        Log.e(TAG, "  Status Message: ${response.message()}")
                        Log.e(TAG, "  Error Body: $errorBody")
                        Log.e(TAG, "═══════════════════════════════════════════════")

                        // Save locally and mark for sync
                        try {
                            val tempBooking = createTempBooking(request)
                            val localBooking =
                                    convertToLocalBooking(tempBooking, syncedWithServer = false)
                            dbHelper.insertBooking(localBooking)
                            Log.d(TAG, "✅ Saved locally with ID: ${tempBooking.id}")

                            // Get user-friendly error message
                            val userMessage = getUserFriendlyErrorMessage(errorCode, errorBody)
                            Result.failure(Exception(userMessage))
                        } catch (dbException: Exception) {
                            Log.e(TAG, "❌ CRITICAL: Failed to save booking locally!", dbException)
                            Result.failure(Exception("Unable to create booking. Please try again."))
                        }
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Exception in createBooking", e)

                    // Save locally on network error
                    try {
                        val tempBooking = createTempBooking(request)
                        val localBooking =
                                convertToLocalBooking(tempBooking, syncedWithServer = false)
                        dbHelper.insertBooking(localBooking)
                        Log.d(TAG, "✅ Saved locally due to network error")
                        Result.failure(
                                Exception(
                                        "No internet connection. Your booking has been saved and will be confirmed when you're back online."
                                )
                        )
                    } catch (dbException: Exception) {
                        Log.e(TAG, "❌ CRITICAL: Network error AND local save failed!", dbException)
                        Result.failure(
                                Exception(
                                        "Unable to create booking. Please check your connection and try again."
                                )
                        )
                    }
                }
            }

    /** Convert server error messages to user-friendly messages */
    private fun getUserFriendlyErrorMessage(errorCode: Int, errorBody: String?): String {
        return when (errorCode) {
            400 -> {
                // Parse specific 400 errors
                when {
                    errorBody?.contains("Station is not open", ignoreCase = true) == true ->
                            "This charging station is closed at the selected time. Please choose a different time or check the station's operating hours."
                    errorBody?.contains("No available slots", ignoreCase = true) == true ->
                            "All charging slots are booked for this time. Please select a different time slot."
                    errorBody?.contains("past date", ignoreCase = true) == true ->
                            "Cannot book for past dates. Please select today or a future date."
                    errorBody?.contains("7 days", ignoreCase = true) == true ->
                            "Bookings can only be made up to 7 days in advance. Please select a closer date."
                    errorBody?.contains("Start time must be before end time", ignoreCase = true) ==
                            true ->
                            "Invalid time range. Please ensure the start time is before the end time."
                    else ->
                            "Unable to create booking. Please check your booking details and try again."
                }
            }
            401 -> "Authentication failed. Please log in again."
            404 -> "Service not available. Please contact support."
            409 ->
                    "This time slot has just been booked by someone else. Please select another slot."
            500 ->
                    "Server is temporarily unavailable. Your booking has been saved locally and will be confirmed when the server is back online."
            else ->
                    "Unable to create booking at this time. Your booking has been saved locally and will be confirmed shortly."
        }
    }

    /** Update existing booking */
    suspend fun updateBooking(id: String, request: UpdateBookingRequest): Result<MessageResponse> =
            withContext(Dispatchers.IO) {
                try {
                    Log.d(TAG, "📡 Updating booking: $id")

                    val response = apiService.updateBooking(id, request)

                    if (response.isSuccessful && response.body() != null) {
                        Log.d(TAG, "✅ Booking updated successfully")
                        Result.success(response.body()!!)
                    } else {
                        Log.e(TAG, "❌ Failed to update booking: ${response.message()}")
                        Result.failure(Exception(response.message() ?: "Failed to update booking"))
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Exception in updateBooking", e)
                    Result.failure(e)
                }
            }

    /** Cancel booking */
suspend fun cancelBooking(
        id: String,
        cancelledBy: String,
        reason: String
): Result<MessageResponse> =
        withContext(Dispatchers.IO) {
            try {
                Log.d(TAG, "📡 Cancelling booking: $id by $cancelledBy")

                val request = CancelBookingRequest(cancelledBy, reason)
                val response = apiService.cancelBooking(id, request)

                if (response.isSuccessful && response.body() != null) {
                    Log.d(TAG, "✅ Booking cancelled successfully")
                    updateLocalBookingStatus(id, "Cancelled")
                    Result.success(response.body()!!)
                } else {
                    val errorBody = response.errorBody()?.string()
                    val errorMessage = when {
                        errorBody?.contains("12 hours", ignoreCase = true) == true ->
                            "Bookings can only be cancelled at least 12 hours before the reservation time"
                        errorBody?.contains("already cancelled", ignoreCase = true) == true ->
                            "This booking has already been cancelled"
                        errorBody?.contains("completed", ignoreCase = true) == true ->
                            "Cannot cancel a completed booking"
                        else -> "Failed to cancel booking: ${response.message()}"
                    }
                    
                    Log.e(TAG, "❌ Failed to cancel booking: $errorMessage")
                    Log.e(TAG, "Error body: $errorBody")
                    Result.failure(Exception(errorMessage))
                }
            } catch (e: Exception) {
                Log.e(TAG, "❌ Exception in cancelBooking", e)
                Result.failure(e)
            }
        }

    /** Update booking status */
    suspend fun updateBookingStatus(id: String, status: String): Result<MessageResponse> =
            withContext(Dispatchers.IO) {
                try {
                    Log.d(TAG, "📡 Updating booking status to: $status")

                    val request = UpdateStatusRequest(status)
                    val response = apiService.updateBookingStatus(id, request)

                    if (response.isSuccessful && response.body() != null) {
                        Log.d(TAG, "✅ Status updated successfully")
                        updateLocalBookingStatus(id, status)
                        Result.success(response.body()!!)
                    } else {
                        Log.e(TAG, "❌ Failed to update status: ${response.message()}")
                        Result.failure(Exception(response.message() ?: "Failed to update status"))
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Exception in updateBookingStatus", e)
                    Result.failure(e)
                }
            }

    /** Scan QR code */
    suspend fun scanQRCode(id: String): Result<MessageResponse> =
            withContext(Dispatchers.IO) {
                try {
                    Log.d(TAG, "📡 Scanning QR code for booking: $id")

                    val response = apiService.scanQRCode(id)

                    if (response.isSuccessful && response.body() != null) {
                        Log.d(TAG, "✅ QR code scanned successfully")
                        Result.success(response.body()!!)
                    } else {
                        Log.e(TAG, "❌ Failed to scan QR code: ${response.message()}")
                        Result.failure(Exception(response.message() ?: "Failed to scan QR code"))
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Exception in scanQRCode", e)
                    Result.failure(e)
                }
            }

    /** Update energy and cost */
    suspend fun updateEnergyAndCost(
            id: String,
            energyConsumed: Double,
            cost: Double
    ): Result<MessageResponse> =
            withContext(Dispatchers.IO) {
                try {
                    Log.d(TAG, "📡 Updating energy ($energyConsumed kWh) and cost ($$cost)")

                    val request = UpdateEnergyCostRequest(energyConsumed, cost)
                    val response = apiService.updateEnergyAndCost(id, request)

                    if (response.isSuccessful && response.body() != null) {
                        Log.d(TAG, "✅ Energy and cost updated successfully")
                        Result.success(response.body()!!)
                    } else {
                        Log.e(TAG, "❌ Failed to update: ${response.message()}")
                        Result.failure(
                                Exception(response.message() ?: "Failed to update energy and cost")
                        )
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Exception in updateEnergyAndCost", e)
                    Result.failure(e)
                }
            }

    /** Get charging rate */
    suspend fun getChargingRate(id: String): Result<ChargingRateResponse> =
            withContext(Dispatchers.IO) {
                try {
                    Log.d(TAG, "📡 Getting charging rate for booking: $id")

                    val response = apiService.getChargingRate(id)

                    if (response.isSuccessful && response.body() != null) {
                        val rate = response.body()!!
                        Log.d(TAG, "✅ Charging rate: ${rate} kW")
                        Result.success(rate)
                    } else {
                        Log.e(TAG, "❌ Failed to get charging rate: ${response.message()}")
                        Result.failure(
                                Exception(response.message() ?: "Failed to get charging rate")
                        )
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Exception in getChargingRate", e)
                    Result.failure(e)
                }
            }

    // ============ STATION OPERATIONS ============

    /** Get all stations */
    suspend fun getAllStations(): Result<List<Station>> =
            withContext(Dispatchers.IO) {
                try {
                    Log.d(TAG, "📡 Fetching all stations...")

                    val response = apiService.getAllStations()

                    if (response.isSuccessful && response.body() != null) {
                        val stations = response.body()!!
                        Log.d(TAG, "✅ Successfully fetched ${stations.size} stations")
                        Result.success(stations)
                    } else {
                        Log.e(TAG, "❌ Failed to fetch stations: ${response.message()}")
                        Result.failure(Exception(response.message() ?: "Failed to fetch stations"))
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Exception in getAllStations", e)
                    Result.failure(e)
                }
            }

    /** Get station by ID */
    suspend fun getStationById(id: String): Result<Station> =
            withContext(Dispatchers.IO) {
                try {
                    Log.d(TAG, "📡 Fetching station: $id")

                    val response = apiService.getStationById(id)

                    if (response.isSuccessful && response.body() != null) {
                        Log.d(TAG, "✅ Station fetched successfully")
                        Result.success(response.body()!!)
                    } else {
                        Log.e(TAG, "❌ Station not found: ${response.message()}")
                        Result.failure(Exception(response.message() ?: "Station not found"))
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Exception in getStationById", e)
                    Result.failure(e)
                }
            }

    // ============ EV OWNER OPERATIONS ============

    /** Get EV owner by NIC */
    suspend fun getEVOwnerByNIC(nic: String): Result<EVOwner> =
            withContext(Dispatchers.IO) {
                try {
                    Log.d(TAG, "📡 Fetching EV owner: $nic")

                    val response = apiService.getEVOwnerByNIC(nic)

                    if (response.isSuccessful && response.body() != null) {
                        Log.d(TAG, "✅ EV owner fetched successfully")
                        Result.success(response.body()!!)
                    } else {
                        Log.e(TAG, "❌ EV owner not found: ${response.message()}")
                        Result.failure(Exception(response.message() ?: "EV Owner not found"))
                    }
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Exception in getEVOwnerByNIC", e)
                    Result.failure(e)
                }
            }

    // ============ HELPER METHODS ============

    private fun syncBookingsToLocal(bookings: List<Booking>) {
        try {
            Log.d(TAG, "💾 Syncing ${bookings.size} bookings to local database")
            dbHelper.clearAllBookings()
            bookings.forEach { booking ->
                try {
                    val localBooking = convertToLocalBooking(booking, syncedWithServer = true)
                    dbHelper.insertBooking(localBooking)
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Failed to insert booking ${booking.id}", e)
                }
            }
            Log.d(TAG, "✅ Database sync completed")
        } catch (e: Exception) {
            Log.e(TAG, "❌ Critical error during database sync", e)
        }
    }

    private fun getLocalBookings(): List<LocalBooking> {
        return dbHelper.getAllBookings()
    }

    private fun convertToLocalBooking(booking: Booking, syncedWithServer: Boolean): LocalBooking {
        return LocalBooking(
                id = booking.id,
                stationId = booking.stationId,
                nic = booking.nic,
                slotId = booking.slotId ?: "",
                reservationDate = booking.reservationDate,
                startTime = booking.startTime,
                endTime = booking.endTime,
                status = booking.status,
                chargerType = booking.chargerType,
                cost = booking.cost,
                energyConsumed = booking.energyConsumed,
                qrCodeData = booking.qrCodeData ?: "",
                syncedWithServer = syncedWithServer,
                lastModified = System.currentTimeMillis()
        )
    }

    private fun convertLocalToBookings(localBookings: List<LocalBooking>): List<Booking> {
        return localBookings.map { local ->
            Booking(
                    id = local.id,
                    stationId = local.stationId,
                    nic = local.nic,
                    slotId = local.slotId,
                    reservationDate = local.reservationDate,
                    startTime = local.startTime,
                    endTime = local.endTime,
                    status = local.status,
                    chargerType = local.chargerType,
                    cost = local.cost,
                    energyConsumed = local.energyConsumed,
                    qrCodeData = local.qrCodeData
            )
        }
    }

    private fun createTempBooking(request: CreateBookingRequest): Booking {
        return Booking(
                id = java.util.UUID.randomUUID().toString(),
                stationId = request.stationId,
                nic = request.nic,
                slotId = "",
                reservationDate = request.reservationDate,
                startTime = request.startTime,
                endTime = request.endTime,
                status = "Pending",
                chargerType = request.chargerType,
                qrCodeData = java.util.UUID.randomUUID().toString()
        )
    }

    private fun updateLocalBookingStatus(id: String, status: String) {
        val localBookings = dbHelper.getAllBookings()
        val booking = localBookings.find { it.id == id }
        booking?.let {
            val updated = it.copy(status = status, lastModified = System.currentTimeMillis())
            dbHelper.updateBooking(updated)
        }
    }

    suspend fun syncUnsyncedBookings(): Result<Int> =
            withContext(Dispatchers.IO) {
                try {
                    val unsyncedBookings = dbHelper.getUnsyncedBookings()
                    Log.d(TAG, "🔄 Syncing ${unsyncedBookings.size} unsynced bookings")
                    var syncedCount = 0

                    unsyncedBookings.forEach { localBooking ->
                        try {
                            val request =
                                    CreateBookingRequest(
                                            stationId = localBooking.stationId,
                                            nic = localBooking.nic,
                                            reservationDate = localBooking.reservationDate,
                                            startTime = localBooking.startTime,
                                            endTime = localBooking.endTime,
                                            chargerType = localBooking.chargerType
                                    )
                            val response = apiService.createBooking(request)
                            if (response.isSuccessful) {
                                dbHelper.markBookingAsSynced(localBooking.id)
                                syncedCount++
                                Log.d(TAG, "✅ Synced booking: ${localBooking.id}")
                            }
                        } catch (e: Exception) {
                            Log.e(TAG, "❌ Failed to sync booking: ${localBooking.id}", e)
                        }
                    }

                    Log.d(TAG, "✅ Successfully synced $syncedCount bookings")
                    Result.success(syncedCount)
                } catch (e: Exception) {
                    Log.e(TAG, "❌ Exception in syncUnsyncedBookings", e)
                    Result.failure(e)
                }
            }
}
