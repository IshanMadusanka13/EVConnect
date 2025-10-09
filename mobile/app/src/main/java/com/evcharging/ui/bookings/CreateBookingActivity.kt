package com.evcharging.ui.bookings

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.evcharging.R
import com.evcharging.models.*
import com.evcharging.repository.BookingRepository
import java.text.SimpleDateFormat
import java.util.*
import kotlinx.coroutines.launch

/** Activity for creating new charging station bookings Implements step-by-step booking process */
class CreateBookingActivity : AppCompatActivity() {

    private lateinit var repository: BookingRepository

    // Step indicators
    private lateinit var step1Indicator: TextView
    private lateinit var step2Indicator: TextView
    private lateinit var step3Indicator: TextView
    private lateinit var step4Indicator: TextView
    private lateinit var step5Indicator: TextView

    // Step containers
    private lateinit var step1Container: LinearLayout
    private lateinit var step2Container: LinearLayout
    private lateinit var step3Container: LinearLayout
    private lateinit var step4Container: LinearLayout
    private lateinit var step5Container: LinearLayout

    // Step 1: EV Owner
    private lateinit var etNIC: EditText
    private lateinit var btnSearchOwner: Button
    private lateinit var tvOwnerDetails: TextView
    private lateinit var ownerDetailsContainer: LinearLayout

    // Step 2: Station Selection
    private lateinit var spinnerStation: Spinner
    private lateinit var tvStationDetails: TextView

    // Step 3: Date and Time
    private lateinit var etDate: EditText
    private lateinit var spinnerStartTime: Spinner
    private lateinit var spinnerEndTime: Spinner
    private lateinit var radioGroupCharger: RadioGroup
    private lateinit var rbAC: RadioButton
    private lateinit var rbDC: RadioButton

    // Step 4: Slot Selection
    private lateinit var radioGroupSlots: RadioGroup
    private lateinit var tvNoSlots: TextView

    // Step 5: Confirmation
    private lateinit var tvConfirmDetails: TextView

    // Navigation buttons
    private lateinit var btnNext: Button
    private lateinit var btnPrevious: Button
    private lateinit var btnConfirm: Button

    // Progress bar
    private lateinit var progressBar: ProgressBar

    // Data holders
    private var currentStep = 1
    private var evOwner: EVOwner? = null
    private var stations = listOf<Station>()
    private var selectedStation: Station? = null
    private var availableSlots = listOf<Slot>()
    private var selectedSlot: Slot? = null
    private var selectedDate = ""
    private var selectedStartTime = ""
    private var selectedEndTime = ""
    private var selectedChargerType = "AC"

    /** Initialize activity */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_booking)

        repository = BookingRepository(this)

        initializeViews()
        setupStepIndicators()
        setupListeners()

        showStep(1)
        loadStations()

        supportActionBar?.apply {
            title = "Create New Booking"
            setDisplayHomeAsUpEnabled(true)
        }
    }

    /** Initialize all view components */
    private fun initializeViews() {
        // Step indicators
        step1Indicator = findViewById(R.id.step1Indicator)
        step2Indicator = findViewById(R.id.step2Indicator)
        step3Indicator = findViewById(R.id.step3Indicator)
        step4Indicator = findViewById(R.id.step4Indicator)
        step5Indicator = findViewById(R.id.step5Indicator)

        // Step containers
        step1Container = findViewById(R.id.step1Container)
        step2Container = findViewById(R.id.step2Container)
        step3Container = findViewById(R.id.step3Container)
        step4Container = findViewById(R.id.step4Container)
        step5Container = findViewById(R.id.step5Container)

        // Step 1 views
        etNIC = findViewById(R.id.etNIC)
        btnSearchOwner = findViewById(R.id.btnSearchOwner)
        tvOwnerDetails = findViewById(R.id.tvOwnerDetails)
        ownerDetailsContainer = findViewById(R.id.ownerDetailsContainer)

        // Step 2 views
        spinnerStation = findViewById(R.id.spinnerStation)
        tvStationDetails = findViewById(R.id.tvStationDetails)

        // Step 3 views
        etDate = findViewById(R.id.etDate)
        spinnerStartTime = findViewById(R.id.spinnerStartTime)
        spinnerEndTime = findViewById(R.id.spinnerEndTime)
        radioGroupCharger = findViewById(R.id.radioGroupCharger)
        rbAC = findViewById(R.id.rbAC)
        rbDC = findViewById(R.id.rbDC)

        // Step 4 views
        radioGroupSlots = findViewById(R.id.radioGroupSlots)
        tvNoSlots = findViewById(R.id.tvNoSlots)

        // Step 5 views
        tvConfirmDetails = findViewById(R.id.tvConfirmDetails)

        // Navigation buttons
        btnNext = findViewById(R.id.btnNext)
        btnPrevious = findViewById(R.id.btnPrevious)
        btnConfirm = findViewById(R.id.btnConfirm)

        progressBar = findViewById(R.id.progressBar)
    }

    /** Setup step indicators styling */
    private fun setupStepIndicators() {
        // Initial state - all inactive except step 1
        updateStepIndicator(step1Indicator, true)
    }

    /** Setup event listeners */
    private fun setupListeners() {
        btnSearchOwner.setOnClickListener { searchEVOwner() }

        etDate.setOnClickListener { showDatePicker() }

        radioGroupCharger.setOnCheckedChangeListener { _, checkedId ->
            selectedChargerType =
                    when (checkedId) {
                        R.id.rbDC -> "DC"
                        else -> "AC"
                    }
        }

        btnNext.setOnClickListener {
            if (validateCurrentStep()) {
                if (currentStep == 3) {
                    // After step 3, check availability before moving to step 4
                    checkAvailability()
                } else {
                    goToNextStep()
                }
            }
        }

        btnPrevious.setOnClickListener { goToPreviousStep() }

        btnConfirm.setOnClickListener { createBooking() }

        // Setup time spinners
        setupTimeSpinners()
    }

    /** Setup time selection spinners */
    private fun setupTimeSpinners() {
        val timeSlots =
                arrayOf(
                        "08:00:00",
                        "09:00:00",
                        "10:00:00",
                        "11:00:00",
                        "12:00:00",
                        "13:00:00",
                        "14:00:00",
                        "15:00:00",
                        "16:00:00",
                        "17:00:00",
                        "18:00:00",
                        "19:00:00",
                        "20:00:00"
                )

        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, timeSlots)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

        spinnerStartTime.adapter = adapter
        spinnerEndTime.adapter = adapter

        // Set default times
        spinnerStartTime.setSelection(0) // 08:00
        spinnerEndTime.setSelection(2) // 10:00
    }

    /** Show date picker dialog */
    private fun showDatePicker() {
        val calendar = Calendar.getInstance()
        val year = calendar.get(Calendar.YEAR)
        val month = calendar.get(Calendar.MONTH)
        val day = calendar.get(Calendar.DAY_OF_MONTH)

        val datePickerDialog =
                DatePickerDialog(
                        this,
                        { _, selectedYear, selectedMonth, selectedDay ->
                            val date = Calendar.getInstance()
                            date.set(selectedYear, selectedMonth, selectedDay)

                            val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                            selectedDate = sdf.format(date.time)

                            val displayFormat =
                                    SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
                            etDate.setText(displayFormat.format(date.time))
                        },
                        year,
                        month,
                        day
                )

        // Set min date to today
        datePickerDialog.datePicker.minDate = calendar.timeInMillis

        // Set max date to 7 days from today
        calendar.add(Calendar.DAY_OF_MONTH, 7)
        datePickerDialog.datePicker.maxDate = calendar.timeInMillis

        datePickerDialog.show()
    }

    /** Load stations from repository */
    private fun loadStations() {
        lifecycleScope.launch {
            val result = repository.getAllStations()

            result
                    .onSuccess { stationList ->
                        stations = stationList.filter { it.isActive }

                        val stationNames = stations.map { it.stationName }
                        val adapter =
                                ArrayAdapter(
                                        this@CreateBookingActivity,
                                        android.R.layout.simple_spinner_item,
                                        stationNames
                                )
                        adapter.setDropDownViewResource(
                                android.R.layout.simple_spinner_dropdown_item
                        )
                        spinnerStation.adapter = adapter

                        spinnerStation.onItemSelectedListener =
                                object : AdapterView.OnItemSelectedListener {
                                    override fun onItemSelected(
                                            parent: AdapterView<*>?,
                                            view: View?,
                                            position: Int,
                                            id: Long
                                    ) {
                                        selectedStation = stations[position]
                                        updateStationDetails()
                                    }
                                    override fun onNothingSelected(parent: AdapterView<*>?) {}
                                }
                    }
                    .onFailure { error ->
                        Toast.makeText(
                                        this@CreateBookingActivity,
                                        "Failed to load stations: ${error.message}",
                                        Toast.LENGTH_LONG
                                )
                                .show()
                    }
        }
    }

    /** Search for EV owner by NIC */
    private fun searchEVOwner() {
        val nic = etNIC.text.toString().trim()

        if (nic.isEmpty()) {
            etNIC.error = "Please enter NIC"
            return
        }

        progressBar.visibility = View.VISIBLE
        btnSearchOwner.isEnabled = false

        lifecycleScope.launch {
            val result = repository.getEVOwnerByNIC(nic)

            progressBar.visibility = View.GONE
            btnSearchOwner.isEnabled = true

            result
                    .onSuccess { owner ->
                        if (!owner.isActive) {
                            Toast.makeText(
                                            this@CreateBookingActivity,
                                            "This EV Owner account is deactivated. Please contact support.",
                                            Toast.LENGTH_LONG
                                    )
                                    .show()
                            evOwner = null
                            ownerDetailsContainer.visibility = View.GONE
                        } else {
                            evOwner = owner
                            displayOwnerDetails(owner)
                            ownerDetailsContainer.visibility = View.VISIBLE
                        }
                    }
                    .onFailure { error ->
                        Toast.makeText(
                                        this@CreateBookingActivity,
                                        "EV Owner not found: ${error.message}",
                                        Toast.LENGTH_LONG
                                )
                                .show()
                        evOwner = null
                        ownerDetailsContainer.visibility = View.GONE
                    }
        }
    }

    /** Display EV owner details */
    private fun displayOwnerDetails(owner: EVOwner) {
        val details =
                """
            Name: ${owner.firstName} ${owner.lastName}
            Email: ${owner.email}
            Phone: ${owner.phoneNumber}
            Vehicle: ${owner.vehicleModel}
            Plate: ${owner.vehiclePlateNumber}
            Battery: ${owner.batteryCapacity}
            Compatible: ${owner.compatibleChargerTypes}
        """.trimIndent()

        tvOwnerDetails.text = details
    }

    /** Update station details display */
    private fun updateStationDetails() {
        selectedStation?.let { station ->
            val details =
                    """
                Address: ${station.address}
                Rating: ${station.rating} ⭐
                Available Slots: ${station.availableSlots}
            """.trimIndent()

            tvStationDetails.text = details
            tvStationDetails.visibility = View.VISIBLE
        }
    }

    /** Check slot availability */
    private fun checkAvailability() {
        progressBar.visibility = View.VISIBLE
        btnNext.isEnabled = false

        selectedStartTime = spinnerStartTime.selectedItem.toString()
        selectedEndTime = spinnerEndTime.selectedItem.toString()

        lifecycleScope.launch {
            val result =
                    repository.checkAvailability(
                            selectedStation!!.id,
                            selectedDate,
                            selectedStartTime,
                            selectedEndTime,
                            selectedChargerType
                    )

            progressBar.visibility = View.GONE
            btnNext.isEnabled = true

            result
                    .onSuccess { slots ->
                        availableSlots = slots

                        if (slots.isEmpty()) {
                            Toast.makeText(
                                            this@CreateBookingActivity,
                                            "No available slots for selected time. Please try different time.",
                                            Toast.LENGTH_LONG
                                    )
                                    .show()
                        } else {
                            displayAvailableSlots(slots)
                            goToNextStep()
                        }
                    }
                    .onFailure { error ->
                        Toast.makeText(
                                        this@CreateBookingActivity,
                                        "Failed to check availability: ${error.message}",
                                        Toast.LENGTH_LONG
                                )
                                .show()
                    }
        }
    }

    /** Display available slots as radio buttons */
    private fun displayAvailableSlots(slots: List<Slot>) {
        radioGroupSlots.removeAllViews()

        slots.forEach { slot ->
            val radioButton = RadioButton(this)
            radioButton.text = "${slot.slotNumber} - ${slot.chargerType} (${slot.powerOutput} kW)"
            radioButton.id = View.generateViewId()
            radioButton.tag = slot

            radioGroupSlots.addView(radioButton)
        }

        radioGroupSlots.setOnCheckedChangeListener { _, checkedId ->
            val radioButton = findViewById<RadioButton>(checkedId)
            selectedSlot = radioButton.tag as Slot
        }

        if (slots.isNotEmpty()) {
            tvNoSlots.visibility = View.GONE
            radioGroupSlots.visibility = View.VISIBLE
        }
    }

    /** Validate current step before proceeding */
    private fun validateCurrentStep(): Boolean {
        return when (currentStep) {
            1 -> {
                if (evOwner == null) {
                    Toast.makeText(this, "Please search and select an EV Owner", Toast.LENGTH_SHORT)
                            .show()
                    false
                } else true
            }
            2 -> {
                if (selectedStation == null) {
                    Toast.makeText(this, "Please select a station", Toast.LENGTH_SHORT).show()
                    false
                } else true
            }
            3 -> {
                when {
                    selectedDate.isEmpty() -> {
                        Toast.makeText(this, "Please select a date", Toast.LENGTH_SHORT).show()
                        false
                    }
                    spinnerStartTime.selectedItem.toString() >=
                            spinnerEndTime.selectedItem.toString() -> {
                        Toast.makeText(
                                        this,
                                        "End time must be after start time",
                                        Toast.LENGTH_SHORT
                                )
                                .show()
                        false
                    }
                    else -> true
                }
            }
            4 -> {
                if (selectedSlot == null) {
                    Toast.makeText(this, "Please select a slot", Toast.LENGTH_SHORT).show()
                    false
                } else true
            }
            else -> true
        }
    }

    /** Navigate to next step */
    private fun goToNextStep() {
        if (currentStep < 5) {
            currentStep++
            showStep(currentStep)

            if (currentStep == 5) {
                displayConfirmationDetails()
            }
        }
    }

    /** Navigate to previous step */
    private fun goToPreviousStep() {
        if (currentStep > 1) {
            currentStep--
            showStep(currentStep)
        }
    }

    /** Show specific step and update UI */
    private fun showStep(step: Int) {
        // Hide all containers
        step1Container.visibility = View.GONE
        step2Container.visibility = View.GONE
        step3Container.visibility = View.GONE
        step4Container.visibility = View.GONE
        step5Container.visibility = View.GONE

        // Show current step
        when (step) {
            1 -> step1Container.visibility = View.VISIBLE
            2 -> step2Container.visibility = View.VISIBLE
            3 -> step3Container.visibility = View.VISIBLE
            4 -> step4Container.visibility = View.VISIBLE
            5 -> step5Container.visibility = View.VISIBLE
        }

        // Update step indicators
        updateStepIndicator(step1Indicator, step >= 1)
        updateStepIndicator(step2Indicator, step >= 2)
        updateStepIndicator(step3Indicator, step >= 3)
        updateStepIndicator(step4Indicator, step >= 4)
        updateStepIndicator(step5Indicator, step >= 5)

        // Update navigation buttons
        btnPrevious.visibility = if (step > 1) View.VISIBLE else View.GONE
        btnNext.visibility = if (step < 5) View.VISIBLE else View.GONE
        btnConfirm.visibility = if (step == 5) View.VISIBLE else View.GONE
    }

    /** Update step indicator appearance */
    private fun updateStepIndicator(indicator: TextView, isActive: Boolean) {
        if (isActive) {
            indicator.setBackgroundResource(R.drawable.step_indicator_active)
            indicator.setTextColor(resources.getColor(android.R.color.white, null))
        } else {
            indicator.setBackgroundResource(R.drawable.step_indicator_inactive)
            indicator.setTextColor(resources.getColor(android.R.color.darker_gray, null))
        }
    }

    /** Display final confirmation details */
    private fun displayConfirmationDetails() {
        val details =
                """
            ═══════════════════════════
            EV OWNER DETAILS
            ═══════════════════════════
            Name: ${evOwner?.firstName} ${evOwner?.lastName}
            NIC: ${evOwner?.nic}
            Vehicle: ${evOwner?.vehicleModel}
            Plate: ${evOwner?.vehiclePlateNumber}
            
            ═══════════════════════════
            STATION DETAILS
            ═══════════════════════════
            Station: ${selectedStation?.stationName}
            Address: ${selectedStation?.address}
            
            ═══════════════════════════
            BOOKING DETAILS
            ═══════════════════════════
            Date: $selectedDate
            Time: $selectedStartTime - $selectedEndTime
            Charger: $selectedChargerType
            Slot: ${selectedSlot?.slotNumber}
            Power: ${selectedSlot?.powerOutput} kW
            
            ═══════════════════════════
        """.trimIndent()

        tvConfirmDetails.text = details
    }

    private fun createBooking() {
        progressBar.visibility = View.VISIBLE
        btnConfirm.isEnabled = false

        val request =
                CreateBookingRequest(
                        stationId = selectedStation!!.id,
                        nic = evOwner!!.nic,
                        reservationDate = selectedDate,
                        startTime = selectedStartTime,
                        endTime = selectedEndTime,
                        chargerType = selectedChargerType
                )

        lifecycleScope.launch {
            val result = repository.createBooking(request)

            progressBar.visibility = View.GONE
            btnConfirm.isEnabled = true

            result
                    .onSuccess { response ->
                        // Success with green checkmark
                        showSuccessDialog(
                                "Booking Confirmed! ✅",
                                "Your charging slot has been successfully reserved for ${formatDate(selectedDate)} from $selectedStartTime to $selectedEndTime.",
                                onDismiss = { finish() }
                        )
                    }
                    .onFailure { error ->
                        // Error with more context
                        val errorMessage =
                                error.message ?: "Unable to create booking. Please try again."

                        // Check if it's a saved-locally scenario
                        if (errorMessage.contains("saved locally", ignoreCase = true) ||
                                        errorMessage.contains(
                                                "saved and will be confirmed",
                                                ignoreCase = true
                                        )
                        ) {
                            showInfoDialog(
                                    "Booking Saved Locally 💾",
                                    errorMessage,
                                    positiveButton = "OK"
                            )
                        } else {
                            showErrorDialog(
                                    "Unable to Create Booking ❌",
                                    errorMessage,
                                    positiveButton = "Try Again",
                                    onPositive = { createBooking() },
                                    negativeButton = "Cancel"
                            )
                        }
                    }
        }
    }

    // Helper function to show success dialog
    private fun showSuccessDialog(title: String, message: String, onDismiss: () -> Unit) {
        android.app.AlertDialog.Builder(this)
                .setTitle(title)
                .setMessage(message)
                .setPositiveButton("OK") { dialog, _ ->
                    dialog.dismiss()
                    onDismiss()
                }
                .setCancelable(false)
                .show()
    }

    // Helper function to show error dialog with retry
    private fun showErrorDialog(
            title: String,
            message: String,
            positiveButton: String = "OK",
            onPositive: (() -> Unit)? = null,
            negativeButton: String? = null
    ) {
        val builder =
                android.app.AlertDialog.Builder(this)
                        .setTitle(title)
                        .setMessage(message)
                        .setPositiveButton(positiveButton) { dialog, _ ->
                            dialog.dismiss()
                            onPositive?.invoke()
                        }

        if (negativeButton != null) {
            builder.setNegativeButton(negativeButton) { dialog, _ -> dialog.dismiss() }
        }

        builder.show()
    }

    // Helper function to show info dialog
    private fun showInfoDialog(title: String, message: String, positiveButton: String = "OK") {
        android.app.AlertDialog.Builder(this)
                .setTitle(title)
                .setMessage(message)
                .setPositiveButton(positiveButton) { dialog, _ ->
                    dialog.dismiss()
                    finish()
                }
                .setCancelable(false)
                .show()
    }

    // Helper to format date nicely
    private fun formatDate(date: String): String {
        // Convert "2025-10-09" to "October 9, 2025" or your preferred format
        return try {
            val inputFormat =
                    java.text.SimpleDateFormat("yyyy-MM-dd", java.util.Locale.getDefault())
            val outputFormat =
                    java.text.SimpleDateFormat("MMMM d, yyyy", java.util.Locale.getDefault())
            val parsedDate = inputFormat.parse(date)
            parsedDate?.let { outputFormat.format(it) } ?: date
        } catch (e: Exception) {
            date
        }
    }

    /** Handle back navigation */
    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }
}
