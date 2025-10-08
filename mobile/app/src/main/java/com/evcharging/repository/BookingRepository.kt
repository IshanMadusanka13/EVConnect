package com.evcharging.repository

import android.content.Context
import com.evcharging.api.RetrofitClient
import com.evcharging.database.DatabaseHelper
import com.evcharging.models.*
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

/**
 * Repository class for booking operations
 * Implements offline-first architecture with server sync
 */
class BookingRepository(private val context: Context) {
    
    private val apiService = RetrofitClient.apiService
    private val dbHelper = DatabaseHelper(context)
    
    // ============ BOOKING OPERATIONS ============
    
    /**
     * Get all bookings with offline support
     * Fetches from server and updates local database
     */
    suspend fun getAllBookings(): Result<List<Booking>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getAllBookings()
            if (response.isSuccessful && response.body() != null) {
                val bookings = response.body()!!
                // Update local database
                syncBookingsToLocal(bookings)
                Result.success(bookings)
            } else {
                // Fallback to local database if server fails
                val localBookings = getLocalBookings()
                if (localBookings.isNotEmpty()) {
                    Result.success(convertLocalToBookings(localBookings))
                } else {
                    Result.failure(Exception(response.message() ?: "Failed to fetch bookings"))
                }
            }
        } catch (e: Exception) {
            // Return local data on network error
            val localBookings = getLocalBookings()
            if (localBookings.isNotEmpty()) {
                Result.success(convertLocalToBookings(localBookings))
            } else {
                Result.failure(e)
            }
        }
    }
    
    /**
     * Get booking by ID
     */
    suspend fun getBookingById(id: String): Result<Booking> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getBookingById(id)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Booking not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get bookings by status
     */
    suspend fun getBookingsByStatus(status: String): Result<List<Booking>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getBookingsByStatus(status)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                // Fallback to local database
                val localBookings = dbHelper.getBookingsByStatus(status)
                Result.success(convertLocalToBookings(localBookings))
            }
        } catch (e: Exception) {
            // Return local data on error
            val localBookings = dbHelper.getBookingsByStatus(status)
            if (localBookings.isNotEmpty()) {
                Result.success(convertLocalToBookings(localBookings))
            } else {
                Result.failure(e)
            }
        }
    }
    
    /**
     * Check slot availability
     */
    suspend fun checkAvailability(
        stationId: String,
        reservationDate: String,
        startTime: String,
        endTime: String,
        chargerType: String
    ): Result<List<Slot>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.checkAvailability(
                stationId, reservationDate, startTime, endTime, chargerType
            )
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to check availability"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Create new booking
     * Saves locally first, then syncs to server
     */
    suspend fun createBooking(request: CreateBookingRequest): Result<BookingResponse> = withContext(Dispatchers.IO) {
        try {
            // Try to create on server first
            val response = apiService.createBooking(request)
            if (response.isSuccessful && response.body() != null) {
                val bookingResponse = response.body()!!
                // Save to local database
                val localBooking = convertToLocalBooking(bookingResponse.booking, syncedWithServer = true)
                dbHelper.insertBooking(localBooking)
                Result.success(bookingResponse)
            } else {
                // Save locally and mark for sync
                val tempBooking = createTempBooking(request)
                val localBooking = convertToLocalBooking(tempBooking, syncedWithServer = false)
                dbHelper.insertBooking(localBooking)
                Result.failure(Exception(response.message() ?: "Saved locally, will sync later"))
            }
        } catch (e: Exception) {
            // Save locally on network error
            val tempBooking = createTempBooking(request)
            val localBooking = convertToLocalBooking(tempBooking, syncedWithServer = false)
            dbHelper.insertBooking(localBooking)
            Result.failure(Exception("Network error: Saved locally, will sync when online"))
        }
    }
    
    /**
     * Update existing booking
     */
    suspend fun updateBooking(id: String, request: UpdateBookingRequest): Result<MessageResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.updateBooking(id, request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update booking"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Cancel booking
     */
    suspend fun cancelBooking(id: String, cancelledBy: String, reason: String): Result<MessageResponse> = withContext(Dispatchers.IO) {
        try {
            val request = CancelBookingRequest(cancelledBy, reason)
            val response = apiService.cancelBooking(id, request)
            if (response.isSuccessful && response.body() != null) {
                // Update local database
                updateLocalBookingStatus(id, "Cancelled")
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to cancel booking"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Update booking status
     */
    suspend fun updateBookingStatus(id: String, status: String): Result<MessageResponse> = withContext(Dispatchers.IO) {
        try {
            val request = UpdateStatusRequest(status)
            val response = apiService.updateBookingStatus(id, request)
            if (response.isSuccessful && response.body() != null) {
                updateLocalBookingStatus(id, status)
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update status"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Scan QR code
     */
    suspend fun scanQRCode(id: String): Result<MessageResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.scanQRCode(id)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to scan QR code"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Update energy and cost
     */
    suspend fun updateEnergyAndCost(id: String, energyConsumed: Double, cost: Double): Result<MessageResponse> = withContext(Dispatchers.IO) {
        try {
            val request = UpdateEnergyCostRequest(energyConsumed, cost)
            val response = apiService.updateEnergyAndCost(id, request)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to update energy and cost"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get charging rate
     */
    suspend fun getChargingRate(id: String): Result<ChargingRateResponse> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getChargingRate(id)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to get charging rate"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // ============ STATION OPERATIONS ============
    
    /**
     * Get all stations
     */
    suspend fun getAllStations(): Result<List<Station>> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getAllStations()
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Failed to fetch stations"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Get station by ID
     */
    suspend fun getStationById(id: String): Result<Station> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getStationById(id)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "Station not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // ============ EV OWNER OPERATIONS ============
    
    /**
     * Get EV owner by NIC
     */
    suspend fun getEVOwnerByNIC(nic: String): Result<EVOwner> = withContext(Dispatchers.IO) {
        try {
            val response = apiService.getEVOwnerByNIC(nic)
            if (response.isSuccessful && response.body() != null) {
                Result.success(response.body()!!)
            } else {
                Result.failure(Exception(response.message() ?: "EV Owner not found"))
            }
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // ============ HELPER METHODS ============
    
    /**
     * Sync bookings from server to local database
     */
    private fun syncBookingsToLocal(bookings: List<Booking>) {
        // Clear existing data
        dbHelper.clearAllBookings()
        // Insert new data
        bookings.forEach { booking ->
            val localBooking = convertToLocalBooking(booking, syncedWithServer = true)
            dbHelper.insertBooking(localBooking)
        }
    }
    
    /**
     * Get bookings from local database
     */
    private fun getLocalBookings(): List<LocalBooking> {
        return dbHelper.getAllBookings()
    }
    
    /**
     * Convert server Booking to LocalBooking
     */
    private fun convertToLocalBooking(booking: Booking, syncedWithServer: Boolean): LocalBooking {
        return LocalBooking(
            id = booking.id,
            stationId = booking.stationId,
            nic = booking.nic,
            slotId = booking.slotId,
            reservationDate = booking.reservationDate,
            startTime = booking.startTime,
            endTime = booking.endTime,
            status = booking.status,
            chargerType = booking.chargerType,
            cost = booking.cost,
            energyConsumed = booking.energyConsumed,
            qrCodeData = booking.qrCodeData,
            syncedWithServer = syncedWithServer,
            lastModified = System.currentTimeMillis()
        )
    }
    
    /**
     * Convert LocalBooking list to Booking list
     */
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
    
    /**
     * Create temporary booking for offline use
     */
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
    
    /**
     * Update local booking status
     */
    private fun updateLocalBookingStatus(id: String, status: String) {
        val localBookings = dbHelper.getAllBookings()
        val booking = localBookings.find { it.id == id }
        booking?.let {
            val updated = it.copy(
                status = status,
                lastModified = System.currentTimeMillis()
            )
            dbHelper.updateBooking(updated)
        }
    }
    
    /**
     * Sync unsynced bookings to server
     */
    suspend fun syncUnsyncedBookings(): Result<Int> = withContext(Dispatchers.IO) {
        try {
            val unsyncedBookings = dbHelper.getUnsyncedBookings()
            var syncedCount = 0
            
            unsyncedBookings.forEach { localBooking ->
                try {
                    val request = CreateBookingRequest(
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
                    }
                } catch (e: Exception) {
                    // Continue with next booking
                }
            }
            
            Result.success(syncedCount)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
}