/**
 * BookingListActivity.kt
 * Activity to display list of all bookings
 * Shows bookings with filtering and search capabilities
 * 
 * @author IT Number: [Your IT Number]
 * @date October 2025
 */

package com.evcharging.ui.bookings

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.evcharging.R
import com.evcharging.models.Booking
import com.evcharging.repository.BookingRepository
import kotlinx.coroutines.launch

/**
 * Main activity for displaying booking list
 * Supports filtering by status and search functionality
 */
class BookingListActivity : AppCompatActivity() {
    
    private lateinit var repository: BookingRepository
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: BookingAdapter
    private lateinit var progressBar: ProgressBar
    private lateinit var emptyView: TextView
    private lateinit var filterSpinner: Spinner
    private lateinit var searchEditText: EditText
    private lateinit var btnCreateBooking: Button
    private lateinit var btnRefresh: ImageButton
    
    private var allBookings = listOf<Booking>()
    private var filteredBookings = listOf<Booking>()
    
    /**
     * Activity lifecycle: onCreate
     * Initialize views and load bookings
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_booking_list)
        
        // Initialize repository
        repository = BookingRepository(this)
        
        // Initialize views
        initializeViews()
        
        // Setup RecyclerView
        setupRecyclerView()
        
        // Setup filters
        setupFilters()
        
        // Load bookings
        loadBookings()
        
        // Setup click listeners
        btnCreateBooking.setOnClickListener {
            startActivity(Intent(this, CreateBookingActivity::class.java))
        }
        
        btnRefresh.setOnClickListener {
            loadBookings()
        }
    }
    
    /**
     * Initialize all view components
     */
    private fun initializeViews() {
        recyclerView = findViewById(R.id.recyclerViewBookings)
        progressBar = findViewById(R.id.progressBar)
        emptyView = findViewById(R.id.textViewEmpty)
        filterSpinner = findViewById(R.id.spinnerFilter)
        searchEditText = findViewById(R.id.editTextSearch)
        btnCreateBooking = findViewById(R.id.btnCreateBooking)
        btnRefresh = findViewById(R.id.btnRefresh)
        
        // Setup action bar
        supportActionBar?.apply {
            title = "My Bookings"
            setDisplayHomeAsUpEnabled(true)
        }
    }
    
    /**
     * Setup RecyclerView with adapter
     */
    private fun setupRecyclerView() {
        adapter = BookingAdapter(
            bookings = emptyList(),
            onItemClick = { booking ->
                // Navigate to booking details
                val intent = Intent(this, BookingDetailsActivity::class.java)
                intent.putExtra("BOOKING_ID", booking.id)
                startActivity(intent)
            },
            onCancelClick = { booking ->
                // Show cancel confirmation dialog
                showCancelDialog(booking)
            }
        )
        
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter
    }
    
    /**
     * Setup filter spinner
     */
    private fun setupFilters() {
        // Status filter options
        val statuses = arrayOf(
            "All Status",
            "Pending",
            "Approved",
            "In Progress",
            "Completed",
            "Cancelled"
        )
        
        val spinnerAdapter = ArrayAdapter(
            this,
            android.R.layout.simple_spinner_item,
            statuses
        )
        spinnerAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        filterSpinner.adapter = spinnerAdapter
        
        // Filter listener
        filterSpinner.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                applyFilters()
            }
            
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }
        
        // Search listener
        searchEditText.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: android.text.Editable?) {
                applyFilters()
            }
        })
    }
    
    /**
     * Load bookings from repository
     */
    private fun loadBookings() {
        progressBar.visibility = View.VISIBLE
        recyclerView.visibility = View.GONE
        emptyView.visibility = View.GONE
        
        lifecycleScope.launch {
            val result = repository.getAllBookings()
            
            progressBar.visibility = View.GONE
            
            result.onSuccess { bookings ->
                allBookings = bookings
                applyFilters()
                
                if (bookings.isEmpty()) {
                    emptyView.visibility = View.VISIBLE
                    emptyView.text = "No bookings found.\nCreate your first booking!"
                } else {
                    recyclerView.visibility = View.VISIBLE
                }
            }.onFailure { error ->
                emptyView.visibility = View.VISIBLE
                emptyView.text = "Failed to load bookings:\n${error.message}"
                Toast.makeText(
                    this@BookingListActivity,
                    "Error: ${error.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
    
    /**
     * Apply filters to booking list
     */
    private fun applyFilters() {
        val selectedStatus = filterSpinner.selectedItem.toString()
        val searchQuery = searchEditText.text.toString().lowercase()
        
        filteredBookings = allBookings.filter { booking ->
            // Status filter
            val matchesStatus = selectedStatus == "All Status" || 
                               booking.status.equals(selectedStatus, ignoreCase = true)
            
            // Search filter
            val matchesSearch = searchQuery.isEmpty() ||
                               booking.stationId.lowercase().contains(searchQuery) ||
                               booking.slotId.lowercase().contains(searchQuery) ||
                               booking.nic.lowercase().contains(searchQuery) ||
                               booking.status.lowercase().contains(searchQuery)
            
            matchesStatus && matchesSearch
        }
        
        // Update adapter
        adapter.updateBookings(filteredBookings)
        
        // Show/hide empty view
        if (filteredBookings.isEmpty() && allBookings.isNotEmpty()) {
            emptyView.visibility = View.VISIBLE
            emptyView.text = "No bookings match your filters"
            recyclerView.visibility = View.GONE
        } else if (filteredBookings.isNotEmpty()) {
            emptyView.visibility = View.GONE
            recyclerView.visibility = View.VISIBLE
        }
    }
    
    /**
     * Show cancellation confirmation dialog
     */
    private fun showCancelDialog(booking: Booking) {
        val builder = androidx.appcompat.app.AlertDialog.Builder(this)
        builder.setTitle("Cancel Booking")
        builder.setMessage("Are you sure you want to cancel this booking?\n\nBooking ID: ${booking.id.take(8)}\nStation: ${booking.stationId}")
        
        // Add reason input
        val input = EditText(this)
        input.hint = "Cancellation reason (optional)"
        builder.setView(input)
        
        builder.setPositiveButton("Cancel Booking") { dialog, _ ->
            val reason = input.text.toString().ifEmpty { "User requested cancellation" }
            cancelBooking(booking.id, reason)
            dialog.dismiss()
        }
        
        builder.setNegativeButton("Keep Booking") { dialog, _ ->
            dialog.dismiss()
        }
        
        builder.show()
    }
    
    /**
     * Cancel a booking
     */
    private fun cancelBooking(bookingId: String, reason: String) {
        progressBar.visibility = View.VISIBLE
        
        lifecycleScope.launch {
            val result = repository.cancelBooking(bookingId, "User", reason)
            
            progressBar.visibility = View.GONE
            
            result.onSuccess { response ->
                Toast.makeText(
                    this@BookingListActivity,
                    response.message,
                    Toast.LENGTH_SHORT
                ).show()
                // Reload bookings
                loadBookings()
            }.onFailure { error ->
                Toast.makeText(
                    this@BookingListActivity,
                    "Failed to cancel booking: ${error.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
    
    /**
     * Handle back button press
     */
    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }
    
    /**
     * Reload bookings when returning to activity
     */
    override fun onResume() {
        super.onResume()
        loadBookings()
    }
}