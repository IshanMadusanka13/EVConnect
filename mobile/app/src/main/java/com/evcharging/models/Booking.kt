package com.evcharging.models

import java.util.*

data class Booking(
    val id: String = UUID.randomUUID().toString(),
    val stationId: String,
    val userId: String,
    val reservationDate: Date,
    val startTime: String,
    val endTime: String,
    var status: String = "Pending",
    var qrCodeData: String? = null
) {
    fun generateQRCode(): String {
        // Logic to generate QR code data
        return "QRCodeDataForBooking:$id"
    }
}