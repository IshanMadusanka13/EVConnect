package com.evcharging.models

import com.google.gson.annotations.SerializedName
import java.io.Serializable

/**
 * Booking entity representing a charging reservation
 */
data class Booking(
    @SerializedName("id") val id: String = "",
    @SerializedName("stationId") val stationId: String = "",
    @SerializedName("nic") val nic: String = "",
    @SerializedName("slotId") val slotId: String = "",
    @SerializedName("reservationDate") val reservationDate: String = "",
    @SerializedName("startTime") val startTime: String = "",
    @SerializedName("endTime") val endTime: String = "",
    @SerializedName("bookingDateTime") val bookingDateTime: String = "",
    @SerializedName("status") val status: String = "Pending",
    @SerializedName("energyConsumed") val energyConsumed: Double = 0.0,
    @SerializedName("chargerType") val chargerType: String = "",
    @SerializedName("cost") val cost: Double = 0.0,
    @SerializedName("qrCodeData") val qrCodeData: String? = null,
    @SerializedName("qrCodeScanned") val qrCodeScanned: Boolean = false,
    @SerializedName("qrScanTime") val qrScanTime: String? = null,
    @SerializedName("isCancelled") val isCancelled: Boolean = false,
    @SerializedName("cancellationDate") val cancellationDate: String? = null,
    @SerializedName("cancelledBy") val cancelledBy: String? = null,
    @SerializedName("cancellationReason") val cancellationReason: String? = null,
    @SerializedName("customerName") val customerName: String? = null,
    @SerializedName("vehicleModel") val vehicleModel: String? = null,
    @SerializedName("rating") val rating: Double = 4.5
) : Serializable

/**
 * Station entity representing a charging station
 */
data class Station(
    @SerializedName("id") val id: String = "",
    @SerializedName("stationName") val stationName: String = "",
    @SerializedName("address") val address: String = "",
    @SerializedName("latitude") val latitude: Double = 0.0,
    @SerializedName("longitude") val longitude: Double = 0.0,
    @SerializedName("isActive") val isActive: Boolean = true,
    @SerializedName("rating") val rating: Double = 4.5,
    @SerializedName("availableSlots") val availableSlots: Int = 0
) : Serializable

/**
 * Slot entity representing a charging slot
 */
data class Slot(
    @SerializedName("id") val id: String = "",
    @SerializedName("stationId") val stationId: String = "",
    @SerializedName("slotNumber") val slotNumber: String = "",
    @SerializedName("chargerType") val chargerType: String = "",
    @SerializedName("powerOutput") val powerOutput: Double = 0.0,
    @SerializedName("isOperational") val isOperational: Boolean = true,
    @SerializedName("slotTypeId") val slotTypeId: String = ""
) : Serializable

/**
 * Station details with slots and schedules
 */
data class StationDetails(
    @SerializedName("station") val station: Station,
    @SerializedName("slots") val slots: List<Slot>,
    @SerializedName("schedules") val schedules: List<StationSchedule>
) : Serializable

/**
 * Station schedule entity
 */
data class StationSchedule(
    @SerializedName("id") val id: String = "",
    @SerializedName("stationId") val stationId: String = "",
    @SerializedName("dayOfWeek") val dayOfWeek: String = "",
    @SerializedName("openTime") val openTime: String = "",
    @SerializedName("closeTime") val closeTime: String = "",
    @SerializedName("isOpen") val isOpen: Boolean = true
) : Serializable

// ============ REQUEST/RESPONSE MODELS ============

/**
 * Request model for creating a booking
 */
data class CreateBookingRequest(
    @SerializedName("stationId") val stationId: String,
    @SerializedName("nic") val nic: String,
    @SerializedName("reservationDate") val reservationDate: String,
    @SerializedName("startTime") val startTime: String,
    @SerializedName("endTime") val endTime: String,
    @SerializedName("chargerType") val chargerType: String
)

/**
 * Request model for updating a booking
 */
data class UpdateBookingRequest(
    @SerializedName("reservationDate") val reservationDate: String,
    @SerializedName("startTime") val startTime: String,
    @SerializedName("endTime") val endTime: String,
    @SerializedName("chargerType") val chargerType: String
)

/**
 * Request model for canceling a booking
 */
data class CancelBookingRequest(
    @SerializedName("cancelledBy") val cancelledBy: String,
    @SerializedName("cancellationReason") val cancellationReason: String
)

/**
 * Request model for updating booking status
 */
data class UpdateStatusRequest(
    @SerializedName("status") val status: String
)

/**
 * Request model for updating energy and cost
 */
data class UpdateEnergyCostRequest(
    @SerializedName("energyConsumed") val energyConsumed: Double,
    @SerializedName("cost") val cost: Double
)

/**
 * Response model for booking creation
 */
data class BookingResponse(
    @SerializedName("message") val message: String,
    @SerializedName("booking") val booking: Booking
)

/**
 * Generic message response
 */
data class MessageResponse(
    @SerializedName("message") val message: String
)

/**
 * Response model for charging rate
 */
data class ChargingRateResponse(
    @SerializedName("chargingRate") val chargingRate: Double,
    @SerializedName("chargerType") val chargerType: String,
    @SerializedName("stationId") val stationId: String,
    @SerializedName("stationName") val stationName: String
)

/**
 * Local database model for bookings (SQLite)
 */
data class LocalBooking(
    val id: String,
    val stationId: String,
    val nic: String,
    val slotId: String,
    val reservationDate: String,
    val startTime: String,
    val endTime: String,
    val status: String,
    val chargerType: String,
    val cost: Double,
    val energyConsumed: Double,
    val qrCodeData: String?,
    val syncedWithServer: Boolean = false,
    val lastModified: Long = System.currentTimeMillis()
)

/**
 * Dashboard statistics model
 */
data class DashboardStats(
    val pendingReservations: Int = 0,
    val approvedReservations: Int = 0,
    val completedReservations: Int = 0,
    val totalRevenue: Double = 0.0
)

/**
 * EV Owner entity - Updated to match web app
 */
data class EVOwner(
    @SerializedName("nic") val nic: String = "",
    @SerializedName("firstName") val firstName: String = "",
    @SerializedName("lastName") val lastName: String = "",
    @SerializedName("dateOfBirth") val dateOfBirth: String? = null,
    @SerializedName("gender") val gender: String = "",
    @SerializedName("email") val email: String = "",
    @SerializedName("phoneNumber") val phoneNumber: String = "",
    @SerializedName("address") val address: String = "",
    @SerializedName("password") val password: String = "",
    @SerializedName("vehicleType") val vehicleType: String = "Car",
    @SerializedName("vehicleModel") val vehicleModel: String = "",
    @SerializedName("vehiclePlateNumber") val vehiclePlateNumber: String = "",
    @SerializedName("batteryCapacity") val batteryCapacity: String = "",
    @SerializedName("compatibleChargerTypes") val compatibleChargerTypes: String = "AC,DC",
    @SerializedName("isActive") val isActive: Boolean = true
) : Serializable

/**
 * Request model for creating EV owner with password
 */
data class CreateEVOwnerRequest(
    @SerializedName("nic") val nic: String,
    @SerializedName("firstName") val firstName: String,
    @SerializedName("lastName") val lastName: String,
    @SerializedName("dateOfBirth") val dateOfBirth: String? = null,
    @SerializedName("gender") val gender: String = "",
    @SerializedName("email") val email: String,
    @SerializedName("phoneNumber") val phoneNumber: String,
    @SerializedName("address") val address: String = "",
    @SerializedName("password") val password: String,
    @SerializedName("vehicleType") val vehicleType: String = "Car",
    @SerializedName("vehicleModel") val vehicleModel: String,
    @SerializedName("vehiclePlateNumber") val vehiclePlateNumber: String,
    @SerializedName("batteryCapacity") val batteryCapacity: String,
    @SerializedName("compatibleChargerTypes") val compatibleChargerTypes: String = "AC,DC"
)

/**
 * Response model for EV owner creation
 */
data class EVOwnerResponse(
    @SerializedName("message") val message: String,
    @SerializedName("owner") val owner: EVOwner
)