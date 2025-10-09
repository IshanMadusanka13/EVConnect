package com.evcharging.ui.bookings

import android.content.Intent
import android.graphics.Bitmap
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.lifecycle.lifecycleScope
import com.evcharging.R
import com.evcharging.models.Booking
import com.evcharging.repository.BookingRepository
import com.google.zxing.BarcodeFormat
import com.google.zxing.MultiFormatWriter
import com.google.zxing.common.BitMatrix
import java.text.SimpleDateFormat
import java.util.*
import kotlinx.coroutines.launch

/**
 * Activity for displaying detailed booking information Supports QR code generation and booking
 * management
 */
class BookingDetailsActivity : AppCompatActivity() {

    companion object {
        private const val TAG = "BookingDetailsActivity"
        private const val REQUEST_UPDATE_BOOKING = 100
    }

    private lateinit var repository: BookingRepository
    private lateinit var progressBar: ProgressBar

    // View components
    private lateinit var tvBookingId: TextView
    private lateinit var tvStationName: TextView
    private lateinit var tvStationAddress: TextView
    private lateinit var tvDate: TextView
    private lateinit var tvTime: TextView
    private lateinit var tvChargerType: TextView
    private lateinit var tvSlot: TextView
    private lateinit var tvStatus: TextView
    private lateinit var tvNIC: TextView
    private lateinit var tvOwnerName: TextView
    private lateinit var tvVehicle: TextView
    private lateinit var tvEnergy: TextView
    private lateinit var tvCost: TextView
    private lateinit var imgQRCode: ImageView
    private lateinit var qrCodeContainer: LinearLayout
    private lateinit var energyContainer: LinearLayout
    private lateinit var ownerContainer: CardView

    // Action buttons
    private lateinit var btnCancel: Button
    private lateinit var btnUpdateBooking: Button
    // private lateinit var btnStartSession: Button
    // private lateinit var btnCompleteSession: Button

    private var booking: Booking? = null
    private var bookingId: String = ""

    /** Initialize activity */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_booking_details)

        repository = BookingRepository(this)

        // Get booking ID from intent
        bookingId = intent.getStringExtra("BOOKING_ID") ?: ""

        initializeViews()

        if (bookingId.isNotEmpty()) {
            loadBookingDetails()
        } else {
            Toast.makeText(this, "Invalid booking ID", Toast.LENGTH_SHORT).show()
            finish()
        }

        supportActionBar?.apply {
            title = "Booking Details"
            setDisplayHomeAsUpEnabled(true)
        }
    }

    override fun onActivityResult(requestCode: Int, resultCode: Int, data: Intent?) {
        super.onActivityResult(requestCode, resultCode, data)

        if (requestCode == REQUEST_UPDATE_BOOKING && resultCode == RESULT_OK) {
            // Reload booking details
            val bookingId = intent.getStringExtra("BOOKING_ID")
            if (bookingId != null) {
                loadBookingDetails()
            }
        }
    }

    /** Initialize all view components */
    private fun initializeViews() {
        progressBar = findViewById(R.id.progressBar)
        tvBookingId = findViewById(R.id.tvBookingId)
        tvStationName = findViewById(R.id.tvStationName)
        tvStationAddress = findViewById(R.id.tvStationAddress)
        tvDate = findViewById(R.id.tvDate)
        tvTime = findViewById(R.id.tvTime)
        tvChargerType = findViewById(R.id.tvChargerType)
        tvSlot = findViewById(R.id.tvSlot)
        tvStatus = findViewById(R.id.tvStatus)
        tvNIC = findViewById(R.id.tvNIC)
        tvOwnerName = findViewById(R.id.tvOwnerName)
        tvVehicle = findViewById(R.id.tvVehicle)
        tvEnergy = findViewById(R.id.tvEnergy)
        tvCost = findViewById(R.id.tvCost)
        imgQRCode = findViewById(R.id.imgQRCode)
        qrCodeContainer = findViewById(R.id.qrCodeContainer)
        energyContainer = findViewById(R.id.energyContainer)
        ownerContainer = findViewById(R.id.ownerContainer)

        btnCancel = findViewById(R.id.btnCancel)
        btnUpdateBooking = findViewById(R.id.btnUpdateBooking)
        // btnStartSession = findViewById(R.id.btnStartSession)
        // btnCompleteSession = findViewById(R.id.btnCompleteSession)

        setupButtons()
    }

    /** Setup button click listeners */
    private fun setupButtons() {
        btnCancel.setOnClickListener { showCancelDialog() }

        // btnStartSession.setOnClickListener { startSession() }

        // btnCompleteSession.setOnClickListener { showCompleteDialog() }
    }

    /** Load booking details from repository */
    private fun loadBookingDetails() {
        progressBar.visibility = View.VISIBLE

        lifecycleScope.launch {
            val result = repository.getBookingById(bookingId)

            progressBar.visibility = View.GONE

            result
                    .onSuccess { bookingData ->
                        booking = bookingData
                        displayBookingDetails(bookingData)
                    }
                    .onFailure { error ->
                        Toast.makeText(
                                        this@BookingDetailsActivity,
                                        "Failed to load booking: ${error.message}",
                                        Toast.LENGTH_LONG
                                )
                                .show()
                        finish()
                    }
        }
    }

    /** Display booking information */
    private fun displayBookingDetails(booking: Booking) {
        // Basic information
        tvBookingId.text = "Booking ID: ${booking.id.take(8).uppercase()}"
        tvStationName.text = booking.stationId
        tvDate.text = formatDate(booking.reservationDate)
        tvTime.text = "${booking.startTime} - ${booking.endTime}"
        tvChargerType.text =
                if (booking.chargerType == "DC") "⚡ ${booking.chargerType}"
                else "🔋 ${booking.chargerType}"
        tvSlot.text = "Slot: ${booking.slotId}"
        tvStatus.text = booking.status
        tvStatus.setBackgroundColor(getStatusColor(booking.status))

        // Owner information
        tvNIC.text = "NIC: ${booking.nic}"
        if (!booking.customerName.isNullOrEmpty()) {
            tvOwnerName.text = "Customer: ${booking.customerName}"
            tvOwnerName.visibility = View.VISIBLE
        } else {
            tvOwnerName.visibility = View.GONE
        }

        if (!booking.vehicleModel.isNullOrEmpty()) {
            tvVehicle.text = "Vehicle: ${booking.vehicleModel}"
            tvVehicle.visibility = View.VISIBLE
        } else {
            tvVehicle.visibility = View.GONE
        }

        // Energy and cost (for completed bookings)
        if (booking.status == "Completed") {
            energyContainer.visibility = View.VISIBLE
            tvEnergy.text = "Energy: ${booking.energyConsumed} kWh"
            tvCost.text = "Cost: Rs.${String.format("%.2f", booking.cost)}"
        } else {
            energyContainer.visibility = View.GONE
        }

        // QR Code (for approved bookings)
        if (booking.status == "Approved" && !booking.qrCodeData.isNullOrEmpty()) {
            qrCodeContainer.visibility = View.VISIBLE
            generateQRCode(booking.qrCodeData!!)
        } else {
            qrCodeContainer.visibility = View.GONE
        }

        if (booking.status == "Pending") {
            val reservationDateTime = parseDateTime(booking.reservationDate, booking.startTime)
            val hoursUntilReservation =
                    (reservationDateTime.time - System.currentTimeMillis()) / (1000 * 60 * 60)

            if (hoursUntilReservation >= 12) {
                btnUpdateBooking.visibility = View.VISIBLE
                btnUpdateBooking.setOnClickListener {
                    val intent = Intent(this, UpdateBookingActivity::class.java)
                    intent.putExtra("BOOKING_ID", booking.id)
                    startActivityForResult(intent, REQUEST_UPDATE_BOOKING)
                }
            } else {
                btnUpdateBooking.visibility = View.GONE
            }
        } else {
            btnUpdateBooking.visibility = View.GONE
        }

        // Action buttons visibility based on status
        updateActionButtons(booking.status)
    }

    private fun parseDateTime(date: String, time: String): Date {
        val dateStr = date.split('T')[0]
        val dateTimeStr = "$dateStr $time"
        return SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).parse(dateTimeStr)!!
    }

    /** Update action buttons visibility based on booking status */
    private fun updateActionButtons(status: String) {
        when (status) {
            "Pending", "Approved" -> {
                btnCancel.visibility = View.VISIBLE
                // btnStartSession.visibility = if (status == "Approved") View.VISIBLE else
                // View.GONE
                // btnCompleteSession.visibility = View.GONE
            }
            "In Progress" -> {
                btnCancel.visibility = View.GONE
                // btnStartSession.visibility = View.GONE
                // btnCompleteSession.visibility = View.VISIBLE
            }
            else -> {
                btnCancel.visibility = View.GONE
                // btnStartSession.visibility = View.GONE
                // btnCompleteSession.visibility = View.GONE
            }
        }
    }

    /** Generate QR code from data string */
    private fun generateQRCode(data: String) {
        try {
            val writer = MultiFormatWriter()
            val bitMatrix: BitMatrix = writer.encode(data, BarcodeFormat.QR_CODE, 512, 512)
            val width = bitMatrix.width
            val height = bitMatrix.height
            val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.RGB_565)

            for (x in 0 until width) {
                for (y in 0 until height) {
                    bitmap.setPixel(
                            x,
                            y,
                            if (bitMatrix[x, y]) android.graphics.Color.BLACK
                            else android.graphics.Color.WHITE
                    )
                }
            }

            imgQRCode.setImageBitmap(bitmap)
        } catch (e: Exception) {
            Toast.makeText(this, "Failed to generate QR code", Toast.LENGTH_SHORT).show()
        }
    }

    /** Show cancellation dialog */
    private fun showCancelDialog() {
        val builder = AlertDialog.Builder(this)
        builder.setTitle("Cancel Booking")
        builder.setMessage("Are you sure you want to cancel this booking?")

        val input = EditText(this)
        input.hint = "Cancellation reason (optional)"
        builder.setView(input)

        builder.setPositiveButton("Cancel Booking") { dialog, _ ->
            val reason = input.text.toString().ifEmpty { "User requested cancellation" }
            cancelBooking(reason)
            dialog.dismiss()
        }

        builder.setNegativeButton("Keep Booking") { dialog, _ -> dialog.dismiss() }

        builder.show()
    }

    /** Cancel booking */
    private fun cancelBooking(reason: String) {
        progressBar.visibility = View.VISIBLE

        lifecycleScope.launch {
            val result = repository.cancelBooking(bookingId, "User", reason)

            progressBar.visibility = View.GONE

            result
                    .onSuccess { response ->
                        Toast.makeText(
                                        this@BookingDetailsActivity,
                                        response.message,
                                        Toast.LENGTH_SHORT
                                )
                                .show()
                        finish()
                    }
                    .onFailure { error ->
                        Toast.makeText(
                                        this@BookingDetailsActivity,
                                        "Failed to cancel: ${error.message}",
                                        Toast.LENGTH_LONG
                                )
                                .show()
                    }
        }
    }

    /** Start charging session */
    private fun startSession() {
        progressBar.visibility = View.VISIBLE

        lifecycleScope.launch {
            // First scan QR code
            val scanResult = repository.scanQRCode(bookingId)

            if (scanResult.isSuccess) {
                // Then update status to In Progress
                val statusResult = repository.updateBookingStatus(bookingId, "In Progress")

                progressBar.visibility = View.GONE

                statusResult
                        .onSuccess { response ->
                            Toast.makeText(
                                            this@BookingDetailsActivity,
                                            "Session started successfully!",
                                            Toast.LENGTH_SHORT
                                    )
                                    .show()
                            loadBookingDetails() // Reload to update UI
                        }
                        .onFailure { error ->
                            Toast.makeText(
                                            this@BookingDetailsActivity,
                                            "Failed to start session: ${error.message}",
                                            Toast.LENGTH_LONG
                                    )
                                    .show()
                        }
            } else {
                progressBar.visibility = View.GONE
                Toast.makeText(
                                this@BookingDetailsActivity,
                                "Failed to scan QR code",
                                Toast.LENGTH_LONG
                        )
                        .show()
            }
        }
    }

    /** Show complete session dialog */
    private fun showCompleteDialog() {
        val builder = AlertDialog.Builder(this)
        builder.setTitle("Complete Session")
        builder.setMessage("Enter the energy consumed during this session:")

        val input = EditText(this)
        input.hint = "Energy (kWh)"
        input.inputType =
                android.text.InputType.TYPE_CLASS_NUMBER or
                        android.text.InputType.TYPE_NUMBER_FLAG_DECIMAL
        builder.setView(input)

        builder.setPositiveButton("Complete") { dialog, _ ->
            val energyStr = input.text.toString()
            if (energyStr.isNotEmpty()) {
                val energy = energyStr.toDoubleOrNull()
                if (energy != null && energy > 0) {
                    completeSession(energy)
                } else {
                    Toast.makeText(this, "Please enter valid energy value", Toast.LENGTH_SHORT)
                            .show()
                }
            } else {
                Toast.makeText(this, "Please enter energy consumed", Toast.LENGTH_SHORT).show()
            }
            dialog.dismiss()
        }

        builder.setNegativeButton("Cancel") { dialog, _ -> dialog.dismiss() }

        builder.show()
    }

    /** Complete charging session */
    private fun completeSession(energyConsumed: Double) {
        progressBar.visibility = View.VISIBLE

        lifecycleScope.launch {
            // Get charging rate
            val rateResult = repository.getChargingRate(bookingId)

            rateResult
                    .onSuccess { rateResponse ->
                        val cost = energyConsumed * rateResponse.chargingRate

                        // Update energy and cost
                        val updateResult =
                                repository.updateEnergyAndCost(bookingId, energyConsumed, cost)

                        updateResult
                                .onSuccess {
                                    // Update status to Completed
                                    val statusResult =
                                            repository.updateBookingStatus(bookingId, "Completed")

                                    progressBar.visibility = View.GONE

                                    statusResult
                                            .onSuccess {
                                                Toast.makeText(
                                                                this@BookingDetailsActivity,
                                                                "Session completed! Cost: $${String.format("%.2f", cost)}",
                                                                Toast.LENGTH_LONG
                                                        )
                                                        .show()
                                                loadBookingDetails() // Reload to update UI
                                            }
                                            .onFailure { error ->
                                                Toast.makeText(
                                                                this@BookingDetailsActivity,
                                                                "Failed to update status: ${error.message}",
                                                                Toast.LENGTH_LONG
                                                        )
                                                        .show()
                                            }
                                }
                                .onFailure { error ->
                                    progressBar.visibility = View.GONE
                                    Toast.makeText(
                                                    this@BookingDetailsActivity,
                                                    "Failed to update energy: ${error.message}",
                                                    Toast.LENGTH_LONG
                                            )
                                            .show()
                                }
                    }
                    .onFailure { error ->
                        progressBar.visibility = View.GONE
                        Toast.makeText(
                                        this@BookingDetailsActivity,
                                        "Failed to get charging rate: ${error.message}",
                                        Toast.LENGTH_LONG
                                )
                                .show()
                    }
        }
    }

    /** Format date for display */
    private fun formatDate(dateString: String): String {
        return try {
            val inputFormat =
                    java.text.SimpleDateFormat(
                            "yyyy-MM-dd'T'HH:mm:ss",
                            java.util.Locale.getDefault()
                    )
            val outputFormat =
                    java.text.SimpleDateFormat("MMM dd, yyyy", java.util.Locale.getDefault())
            val date = inputFormat.parse(dateString)
            date?.let { outputFormat.format(it) } ?: dateString
        } catch (e: Exception) {
            try {
                val simpleFormat =
                        java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
                val outputFormat =
                        java.text.SimpleDateFormat("MMM dd, yyyy", java.util.Locale.getDefault())
                val date = simpleFormat.parse(dateString)
                date?.let { outputFormat.format(it) } ?: dateString
            } catch (e: Exception) {
                dateString
            }
        }
    }

    /** Get status color */
    private fun getStatusColor(status: String): Int {
        return when (status) {
            "Pending" -> android.graphics.Color.parseColor("#F59E0B")
            "Approved" -> android.graphics.Color.parseColor("#3B82F6")
            "In Progress" -> android.graphics.Color.parseColor("#10B981")
            "Completed" -> android.graphics.Color.parseColor("#6366F1")
            "Cancelled", "Rejected" -> android.graphics.Color.parseColor("#EF4444")
            else -> android.graphics.Color.parseColor("#6B7280")
        }
    }

    /** Handle back navigation */
    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }
}
