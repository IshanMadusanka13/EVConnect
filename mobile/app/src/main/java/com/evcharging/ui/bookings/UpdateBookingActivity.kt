package com.evcharging.ui.bookings

import android.app.DatePickerDialog
import android.app.TimePickerDialog
import android.os.Bundle
import android.util.Log
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.GridLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.evcharging.R
import com.evcharging.models.*
import com.evcharging.repository.BookingRepository
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class UpdateBookingActivity : AppCompatActivity() {

    private lateinit var repository: BookingRepository
    private lateinit var booking: Booking

    // UI Components
    private lateinit var tvBookingId: TextView
    private lateinit var tvStationName: TextView
    private lateinit var tvCurrentDate: TextView
    private lateinit var tvCurrentTime: TextView
    private lateinit var btnSelectDate: Button
    private lateinit var tvNewDate: TextView
    private lateinit var spinnerStartTime: Spinner
    private lateinit var spinnerEndTime: Spinner
    private lateinit var radioGroupCharger: RadioGroup
    private lateinit var radioAC: RadioButton
    private lateinit var radioDC: RadioButton
    private lateinit var btnCheckAvailability: Button
    private lateinit var recyclerViewSlots: RecyclerView
    private lateinit var tvSlotsHeader: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var btnUpdateBooking: Button
    private lateinit var btnCancel: Button

    private var selectedDate: String = ""
    private var selectedStartTime: String = ""
    private var selectedEndTime: String = ""
    private var selectedChargerType: String = "AC"
    private var selectedSlotId: String = ""
    private var availableSlots = listOf<Slot>()

    private lateinit var slotAdapter: SlotSelectionAdapter

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_update_booking)

        repository = BookingRepository(this)

        // Get booking ID from intent
        val bookingId = intent.getStringExtra("BOOKING_ID")
        if (bookingId == null) {
            Toast.makeText(this, "Invalid booking ID", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        initializeViews()
        setupListeners()
        loadBookingDetails(bookingId)
    }

    private fun initializeViews() {
        tvBookingId = findViewById(R.id.tvBookingId)
        tvStationName = findViewById(R.id.tvStationName)
        tvCurrentDate = findViewById(R.id.tvCurrentDate)
        tvCurrentTime = findViewById(R.id.tvCurrentTime)
        btnSelectDate = findViewById(R.id.btnSelectDate)
        tvNewDate = findViewById(R.id.tvNewDate)
        spinnerStartTime = findViewById(R.id.spinnerStartTime)
        spinnerEndTime = findViewById(R.id.spinnerEndTime)
        radioGroupCharger = findViewById(R.id.radioGroupCharger)
        radioAC = findViewById(R.id.radioAC)
        radioDC = findViewById(R.id.radioDC)
        btnCheckAvailability = findViewById(R.id.btnCheckAvailability)
        recyclerViewSlots = findViewById(R.id.recyclerViewSlots)
        tvSlotsHeader = findViewById(R.id.tvSlotsHeader)
        progressBar = findViewById(R.id.progressBar)
        btnUpdateBooking = findViewById(R.id.btnUpdateBooking)
        btnCancel = findViewById(R.id.btnCancel)

        supportActionBar?.apply {
            title = "Update Booking"
            setDisplayHomeAsUpEnabled(true)
        }

        // Setup time spinners
        setupTimeSpinners()

        // Setup slots RecyclerView
        slotAdapter = SlotSelectionAdapter(emptyList()) { slot ->
            selectedSlotId = slot.id
            slotAdapter.setSelectedSlot(slot.id)
            btnUpdateBooking.isEnabled = true
        }
        recyclerViewSlots.layoutManager = GridLayoutManager(this, 4)
        recyclerViewSlots.adapter = slotAdapter
    }

    private fun setupTimeSpinners() {
        val timeSlots = arrayOf(
            "08:00:00", "09:00:00", "10:00:00", "11:00:00", "12:00:00",
            "13:00:00", "14:00:00", "15:00:00", "16:00:00", "17:00:00",
            "18:00:00", "19:00:00", "20:00:00"
        )

        val adapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, timeSlots)
        adapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)

        spinnerStartTime.adapter = adapter
        spinnerEndTime.adapter = adapter

        spinnerStartTime.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                selectedStartTime = timeSlots[position]
                // Reset end time if it's before or equal to start time
                val currentEndPosition = spinnerEndTime.selectedItemPosition
                if (currentEndPosition <= position) {
                    if (position + 1 < timeSlots.size) {
                        spinnerEndTime.setSelection(position + 1)
                    }
                }
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        spinnerEndTime.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                selectedEndTime = timeSlots[position]
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
    }

    private fun setupListeners() {
        btnSelectDate.setOnClickListener {
            showDatePicker()
        }

        radioGroupCharger.setOnCheckedChangeListener { _, checkedId ->
            selectedChargerType = if (checkedId == R.id.radioAC) "AC" else "DC"
        }

        btnCheckAvailability.setOnClickListener {
            if (validateInputs()) {
                checkAvailability()
            }
        }

        btnUpdateBooking.setOnClickListener {
            updateBooking()
        }

        btnCancel.setOnClickListener {
            finish()
        }
    }

    private fun loadBookingDetails(bookingId: String) {
        progressBar.visibility = View.VISIBLE

        lifecycleScope.launch {
            val result = repository.getBookingById(bookingId)

            progressBar.visibility = View.GONE

            result.onSuccess { bookingData ->
                booking = bookingData

                // Check if booking can be updated
                if (booking.status != "Pending") {
                    Toast.makeText(
                        this@UpdateBookingActivity,
                        "Only pending bookings can be updated",
                        Toast.LENGTH_LONG
                    ).show()
                    finish()
                    return@onSuccess
                }

                // Check 12-hour rule
                val reservationDateTime = parseDateTime(booking.reservationDate, booking.startTime)
                val hoursUntilReservation = (reservationDateTime.time - System.currentTimeMillis()) / (1000 * 60 * 60)

                if (hoursUntilReservation < 12) {
                    Toast.makeText(
                        this@UpdateBookingActivity,
                        "Bookings can only be updated at least 12 hours before the reservation time",
                        Toast.LENGTH_LONG
                    ).show()
                    finish()
                    return@onSuccess
                }

                displayBookingInfo()
            }.onFailure { error ->
                Toast.makeText(
                    this@UpdateBookingActivity,
                    "Failed to load booking: ${error.message}",
                    Toast.LENGTH_LONG
                ).show()
                finish()
            }
        }
    }

    private fun displayBookingInfo() {
        tvBookingId.text = "Booking ID: ${booking.id.take(8)}"
        tvStationName.text = "Station: ${booking.stationId}"
        
        val date = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
            .format(SimpleDateFormat("yyyy-MM-dd", Locale.getDefault()).parse(booking.reservationDate.split('T')[0])!!)
        tvCurrentDate.text = "Current Date: $date"
        tvCurrentTime.text = "Current Time: ${booking.startTime} - ${booking.endTime}"

        // Pre-select current values
        selectedChargerType = booking.chargerType
        if (selectedChargerType == "AC") {
            radioAC.isChecked = true
        } else {
            radioDC.isChecked = true
        }

        // Set default date to current booking date
        selectedDate = booking.reservationDate.split('T')[0]
        tvNewDate.text = date
    }

    private fun showDatePicker() {
        val calendar = Calendar.getInstance()
        val currentDate = calendar.clone() as Calendar

        // Set min date to tomorrow
        calendar.add(Calendar.DAY_OF_MONTH, 0)
        val minDate = calendar.timeInMillis

        // Set max date to 7 days from now
        calendar.add(Calendar.DAY_OF_MONTH, 7)
        val maxDate = calendar.timeInMillis

        val datePicker = DatePickerDialog(
            this,
            { _, year, month, dayOfMonth ->
                val selectedCalendar = Calendar.getInstance()
                selectedCalendar.set(year, month, dayOfMonth)
                
                selectedDate = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                    .format(selectedCalendar.time)
                
                tvNewDate.text = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
                    .format(selectedCalendar.time)
            },
            currentDate.get(Calendar.YEAR),
            currentDate.get(Calendar.MONTH),
            currentDate.get(Calendar.DAY_OF_MONTH)
        )

        datePicker.datePicker.minDate = minDate
        datePicker.datePicker.maxDate = maxDate
        datePicker.show()
    }

    private fun validateInputs(): Boolean {
        if (selectedDate.isEmpty()) {
            Toast.makeText(this, "Please select a date", Toast.LENGTH_SHORT).show()
            return false
        }

        if (selectedStartTime.isEmpty() || selectedEndTime.isEmpty()) {
            Toast.makeText(this, "Please select start and end time", Toast.LENGTH_SHORT).show()
            return false
        }

        if (selectedStartTime >= selectedEndTime) {
            Toast.makeText(this, "End time must be after start time", Toast.LENGTH_SHORT).show()
            return false
        }

        return true
    }

    private fun checkAvailability() {
        progressBar.visibility = View.VISIBLE
        tvSlotsHeader.visibility = View.GONE
        recyclerViewSlots.visibility = View.GONE

        lifecycleScope.launch {
            val result = repository.checkAvailability(
                booking.stationId,
                selectedDate,
                selectedStartTime,
                selectedEndTime,
                selectedChargerType
            )

            progressBar.visibility = View.GONE

            result.onSuccess { slots ->
                availableSlots = slots

                if (slots.isEmpty()) {
                    Toast.makeText(
                        this@UpdateBookingActivity,
                        "No available slots for the selected time",
                        Toast.LENGTH_LONG
                    ).show()
                } else {
                    tvSlotsHeader.visibility = View.VISIBLE
                    tvSlotsHeader.text = "Available Slots (${slots.size})"
                    recyclerViewSlots.visibility = View.VISIBLE
                    slotAdapter.updateSlots(slots)
                }
            }.onFailure { error ->
                Toast.makeText(
                    this@UpdateBookingActivity,
                    "Failed to check availability: ${error.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    private fun updateBooking() {
        if (selectedSlotId.isEmpty()) {
            Toast.makeText(this, "Please select a slot", Toast.LENGTH_SHORT).show()
            return
        }

        progressBar.visibility = View.VISIBLE
        btnUpdateBooking.isEnabled = false

        val request = UpdateBookingRequest(
            reservationDate = selectedDate,
            startTime = selectedStartTime,
            endTime = selectedEndTime,
            chargerType = selectedChargerType
        )

        lifecycleScope.launch {
            val result = repository.updateBooking(booking.id, request)

            progressBar.visibility = View.GONE

            result.onSuccess { response ->
                Toast.makeText(
                    this@UpdateBookingActivity,
                    response.message,
                    Toast.LENGTH_SHORT
                ).show()
                setResult(RESULT_OK)
                finish()
            }.onFailure { error ->
                btnUpdateBooking.isEnabled = true
                Toast.makeText(
                    this@UpdateBookingActivity,
                    error.message ?: "Failed to update booking",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    private fun parseDateTime(date: String, time: String): Date {
        val dateStr = date.split('T')[0]
        val dateTimeStr = "$dateStr $time"
        return SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).parse(dateTimeStr)!!
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }
}

// Slot Selection Adapter
class SlotSelectionAdapter(
    private var slots: List<Slot>,
    private val onSlotClick: (Slot) -> Unit
) : RecyclerView.Adapter<SlotSelectionAdapter.SlotViewHolder>() {

    private var selectedSlotId: String = ""

    inner class SlotViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvSlotNumber: TextView = itemView.findViewById(R.id.tvSlotNumber)
        val tvChargerType: TextView = itemView.findViewById(R.id.tvChargerType)
        val tvPowerOutput: TextView = itemView.findViewById(R.id.tvPowerOutput)
        val cardView: androidx.cardview.widget.CardView = itemView.findViewById(R.id.cardViewSlot)
    }

    override fun onCreateViewHolder(parent: android.view.ViewGroup, viewType: Int): SlotViewHolder {
        val view = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.item_slot_selection, parent, false)
        return SlotViewHolder(view)
    }

    override fun onBindViewHolder(holder: SlotViewHolder, position: Int) {
        val slot = slots[position]

        holder.tvSlotNumber.text = slot.slotNumber
        holder.tvChargerType.text = slot.chargerType
        holder.tvPowerOutput.text = "${slot.powerOutput}kW"

        // Highlight selected slot
        val isSelected = slot.id == selectedSlotId
        if (isSelected) {
            holder.cardView.setCardBackgroundColor(
                android.graphics.Color.parseColor("#3B82F6")
            )
            holder.tvSlotNumber.setTextColor(android.graphics.Color.WHITE)
            holder.tvChargerType.setTextColor(android.graphics.Color.WHITE)
            holder.tvPowerOutput.setTextColor(android.graphics.Color.WHITE)
        } else {
            holder.cardView.setCardBackgroundColor(android.graphics.Color.WHITE)
            holder.tvSlotNumber.setTextColor(android.graphics.Color.parseColor("#111827"))
            holder.tvChargerType.setTextColor(android.graphics.Color.parseColor("#6B7280"))
            holder.tvPowerOutput.setTextColor(android.graphics.Color.parseColor("#6B7280"))
        }

        holder.itemView.setOnClickListener {
            onSlotClick(slot)
        }
    }

    override fun getItemCount() = slots.size

    fun updateSlots(newSlots: List<Slot>) {
        slots = newSlots
        notifyDataSetChanged()
    }

    fun setSelectedSlot(slotId: String) {
        selectedSlotId = slotId
        notifyDataSetChanged()
    }
}