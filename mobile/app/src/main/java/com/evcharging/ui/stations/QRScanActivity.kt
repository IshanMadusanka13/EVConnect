package com.evcharging.ui.scan

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.EditText
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import androidx.lifecycle.lifecycleScope
import com.budiyev.android.codescanner.AutoFocusMode
import com.budiyev.android.codescanner.CodeScanner
import com.budiyev.android.codescanner.DecodeCallback
import com.budiyev.android.codescanner.ErrorCallback
import com.evcharging.R
import com.evcharging.repository.BookingRepository
import kotlinx.coroutines.launch

/**
 * Activity for scanning QR codes for booking validation
 * User must enter booking ID AND scan QR code
 */
class QRScanActivity : AppCompatActivity() {

    private lateinit var codeScanner: CodeScanner
    private lateinit var repository: BookingRepository

    // UI components
    private lateinit var etBookingId: EditText
    private lateinit var btnScanQR: Button
    private lateinit var btnSubmit: Button
    private lateinit var tvScanStatus: TextView
    private lateinit var tvBookingStatus: TextView
    private lateinit var tvInstructions: TextView

    private var scannedQRData: String? = null
    private var enteredBookingId: String? = null
    private var isScanning = false
    private var isBookingValid = false

    companion object {
        private const val TAG = "QRScanActivity"
        private const val CAMERA_PERMISSION_REQUEST = 1001
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_qr_scan)

        initializeViews()
        setupRepository()
        setupClickListeners()

        supportActionBar?.title = "Scan QR for Booking"
        supportActionBar?.setDisplayHomeAsUpEnabled(true)

        updateUIState()
    }

    private fun initializeViews() {
        etBookingId = findViewById(R.id.etBookingId)
        btnScanQR = findViewById(R.id.btnScanQR)
        btnSubmit = findViewById(R.id.btnSubmit)
        tvScanStatus = findViewById(R.id.tvScanStatus)
        tvBookingStatus = findViewById(R.id.tvBookingStatus)
        tvInstructions = findViewById(R.id.tvInstructions)
    }

    private fun setupRepository() {
        repository = BookingRepository(this)
    }

    private fun setupClickListeners() {
        // Validate booking ID when user stops typing
        etBookingId.setOnFocusChangeListener { _, hasFocus ->
            if (!hasFocus) {
                validateBookingId()
            }
        }

        etBookingId.setOnEditorActionListener { _, _, _ ->
            validateBookingId()
            true
        }

        btnScanQR.setOnClickListener {
            if (enteredBookingId.isNullOrEmpty()) {
                showError("Please enter booking ID first")
                return@setOnClickListener
            }

            if (!isBookingValid) {
                showError("Please validate booking ID first")
                return@setOnClickListener
            }

            if (hasCameraPermission()) {
                startQRScanner()
            } else {
                requestCameraPermission()
            }
        }

        btnSubmit.setOnClickListener {
            submitScanData()
        }
    }

    private fun validateBookingId() {
        val bookingId = etBookingId.text.toString().trim()
        if (bookingId.isEmpty()) {
            tvBookingStatus.text = "Please enter booking ID"
            tvBookingStatus.setTextColor(ContextCompat.getColor(this, android.R.color.holo_red_dark))
            isBookingValid = false
            updateUIState()
            return
        }

        lifecycleScope.launch {
            showLoading("Validating booking ID...")

            try {
                val result = repository.getBookingById(bookingId)

                result.onSuccess { booking ->
                    enteredBookingId = bookingId
                    isBookingValid = true

                    // Check if booking can be scanned
                    when {
                        booking.status == "Cancelled" -> {
                            tvBookingStatus.text = "Booking is cancelled"
                            tvBookingStatus.setTextColor(ContextCompat.getColor(this@QRScanActivity, android.R.color.holo_red_dark))
                            isBookingValid = false
                        }
                        booking.status == "Completed" -> {
                            tvBookingStatus.text = "Booking already completed"
                            tvBookingStatus.setTextColor(ContextCompat.getColor(this@QRScanActivity, android.R.color.holo_red_dark))
                            isBookingValid = false
                        }
                        booking.qrCodeScanned == true -> {
                            tvBookingStatus.text = "QR already scanned"
                            tvBookingStatus.setTextColor(ContextCompat.getColor(this@QRScanActivity, android.R.color.holo_orange_dark))
                            isBookingValid = false
                        }
                        else -> {
                            tvBookingStatus.text = "Valid booking - ${booking.status}"
                            tvBookingStatus.setTextColor(ContextCompat.getColor(this@QRScanActivity, android.R.color.holo_green_dark))
                            isBookingValid = true
                        }
                    }

                    updateUIState()
                    showSuccess("Booking validated successfully")

                }.onFailure { error ->
                    enteredBookingId = null
                    isBookingValid = false
                    tvBookingStatus.text = "Invalid booking ID: ${error.message}"
                    tvBookingStatus.setTextColor(ContextCompat.getColor(this@QRScanActivity, android.R.color.holo_red_dark))
                    updateUIState()
                    showError("Booking not found: ${error.message}")
                }

            } catch (e: Exception) {
                Log.e(TAG, "Validation error", e)
                showError("Validation failed: ${e.message}")
            }
        }
    }

    private fun startQRScanner() {
        if (isScanning) return

        try {
            val scannerView = findViewById<com.budiyev.android.codescanner.CodeScannerView>(R.id.scanner_view)
            codeScanner = CodeScanner(this, scannerView)

            // Scanner configuration
            codeScanner.apply {
                camera = CodeScanner.CAMERA_BACK
                formats = CodeScanner.ALL_FORMATS
                autoFocusMode = AutoFocusMode.SAFE
                scanMode = CodeScanner.SCAN_MODE_CONTINUOUS
                isAutoFocusEnabled = true
                isFlashEnabled = false

                decodeCallback = DecodeCallback { result ->
                    runOnUiThread {
                        handleScanResult(result.text)
                    }
                }

                errorCallback = ErrorCallback { error ->
                    runOnUiThread {
                        Log.e(TAG, "Camera initialization error: ${error.message}")
                        showError("Camera error: ${error.message}")
                    }
                }
            }

            scannerView.setOnClickListener {
                codeScanner.startPreview()
            }

            isScanning = true
            updateUIState()
            codeScanner.startPreview()
            tvInstructions.text = "Point camera at QR code to scan"

        } catch (e: Exception) {
            Log.e(TAG, "Failed to start QR scanner", e)
            showError("Failed to start camera: ${e.message}")
        }
    }

    private fun handleScanResult(scanResult: String) {
        Log.d(TAG, "QR Scan Result: $scanResult")

        scannedQRData = scanResult
        tvScanStatus.text = "QR Code Scanned: ${if (scanResult.length > 30) scanResult.substring(0, 30) + "..." else scanResult}"
        tvScanStatus.setTextColor(ContextCompat.getColor(this, android.R.color.holo_green_dark))

        showSuccess("QR Code scanned successfully!")
        stopScanner()
        updateUIState()

        // Auto-submit after short delay
        lifecycleScope.launch {
            kotlinx.coroutines.delay(1000)
            submitScanData()
        }
    }

    private fun submitScanData() {
        val bookingId = enteredBookingId
        val qrData = scannedQRData

        if (bookingId == null || !isBookingValid) {
            showError("Please enter and validate a booking ID first")
            return
        }

        if (qrData == null) {
            showError("Please scan a QR code first")
            return
        }

        lifecycleScope.launch {
            showLoading("Submitting scan data...")

            try {
                // Send scan to backend - the API should handle the QR data
                val result = repository.scanQRCode(bookingId)

                result.onSuccess { response ->
                    Log.d(TAG, "QR scan successful: ${response.message}")
                    showSuccess("Scan Submitted Successfully! ${response.message}")

                    // Return to previous activity with success result
                    val intent = Intent().apply {
                        putExtra("SCANNED_BOOKING_ID", bookingId)
                        putExtra("QR_DATA", qrData)
                        putExtra("SCAN_RESULT", "SUCCESS")
                    }
                    setResult(RESULT_OK, intent)

                    // Delay before finishing to show success message
                    lifecycleScope.launch {
                        kotlinx.coroutines.delay(2000)
                        finish()
                    }

                }.onFailure { error ->
                    Log.e(TAG, "QR scan submission failed", error)
                    showError("Scan submission failed: ${error.message}")
                }

            } catch (e: Exception) {
                Log.e(TAG, "Exception during scan submission", e)
                showError("Submission error: ${e.message}")
            }
        }
    }

    private fun updateUIState() {
        // Update scan button
        btnScanQR.isEnabled = isBookingValid && !isScanning
        btnScanQR.alpha = if (isBookingValid && !isScanning) 1.0f else 0.5f

        // Update submit button
        val canSubmit = isBookingValid && scannedQRData != null
        btnSubmit.isEnabled = canSubmit
        btnSubmit.alpha = if (canSubmit) 1.0f else 0.5f

        // Update scanner view visibility
        val scannerView = findViewById<com.budiyev.android.codescanner.CodeScannerView>(R.id.scanner_view)
        scannerView.visibility = if (isScanning) android.view.View.VISIBLE else android.view.View.GONE

        // Update instructions
        when {
            !isBookingValid -> tvInstructions.text = "Step 1: Enter and validate booking ID"
            isScanning -> tvInstructions.text = "Step 2: Point camera at QR code"
            scannedQRData == null -> tvInstructions.text = "Step 2: Tap 'Scan QR Code' to proceed"
            else -> tvInstructions.text = "Ready to submit scan data"
        }
    }

    private fun hasCameraPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            this,
            Manifest.permission.CAMERA
        ) == PackageManager.PERMISSION_GRANTED
    }

    private fun requestCameraPermission() {
        ActivityCompat.requestPermissions(
            this,
            arrayOf(Manifest.permission.CAMERA),
            CAMERA_PERMISSION_REQUEST
        )
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        when (requestCode) {
            CAMERA_PERMISSION_REQUEST -> {
                if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                    startQRScanner()
                } else {
                    showError("Camera permission is required to scan QR codes")
                }
            }
        }
    }

    private fun stopScanner() {
        if (isScanning) {
            try {
                codeScanner.releaseResources()
                isScanning = false
                updateUIState()
            } catch (e: Exception) {
                Log.e(TAG, "Error stopping scanner", e)
            }
        }
    }

    private fun showLoading(message: String) {
        tvInstructions.text = message
        btnSubmit.isEnabled = false
        btnScanQR.isEnabled = false
    }

    private fun showSuccess(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
        updateUIState()
    }

    private fun showError(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_LONG).show()
        updateUIState()
    }

    override fun onResume() {
        super.onResume()
        if (isScanning) {
            try {
                codeScanner.startPreview()
            } catch (e: Exception) {
                Log.e(TAG, "Failed to resume scanner", e)
            }
        }
    }

    override fun onPause() {
        super.onPause()
        stopScanner()
    }

    override fun onDestroy() {
        super.onDestroy()
        stopScanner()
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }
}