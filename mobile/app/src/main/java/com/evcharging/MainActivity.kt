package com.evcharging

import android.content.Intent
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.evcharging.models.DashboardStats
import com.evcharging.repository.BookingRepository
import com.evcharging.ui.bookings.BookingListActivity
import kotlinx.coroutines.launch

/**
 * Main activity serving as the dashboard and entry point
 * Displays booking statistics and navigation options
 */
class MainActivity : AppCompatActivity() {
    
    private lateinit var repository: BookingRepository
    
    // Dashboard statistics views
    private lateinit var tvPendingCount: TextView
    private lateinit var tvApprovedCount: TextView
    private lateinit var tvCompletedCount: TextView
    private lateinit var tvTotalRevenue: TextView
    
    // Navigation buttons
    private lateinit var btnViewBookings: Button
    private lateinit var btnCreateBooking: Button
    
    /**
     * Initialize the activity
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        
        repository = BookingRepository(this)
        
        initializeViews()
        setupButtons()
        loadDashboardStats()
        
        supportActionBar?.title = "EV Charging Hub"
    }
    
    /**
     * Initialize view components
     */
    private fun initializeViews() {
        tvPendingCount = findViewById(R.id.tvPendingCount)
        tvApprovedCount = findViewById(R.id.tvApprovedCount)
        tvCompletedCount = findViewById(R.id.tvCompletedCount)
        tvTotalRevenue = findViewById(R.id.tvTotalRevenue)
        
        btnViewBookings = findViewById(R.id.btnViewBookings)
        btnCreateBooking = findViewById(R.id.btnCreateBooking)
    }
    
    /**
     * Setup button click listeners
     */
    private fun setupButtons() {
        btnViewBookings.setOnClickListener {
            startActivity(Intent(this, BookingListActivity::class.java))
        }
        
        btnCreateBooking.setOnClickListener {
            val intent = Intent(this, BookingListActivity::class.java)
            startActivity(intent)
        }
    }
    
    /**
     * Load dashboard statistics
     */
    private fun loadDashboardStats() {
        lifecycleScope.launch {
            val result = repository.getAllBookings()
            
            result.onSuccess { bookings ->
                val stats = DashboardStats(
                    pendingReservations = bookings.count { it.status == "Pending" },
                    approvedReservations = bookings.count { it.status == "Approved" },
                    completedReservations = bookings.count { it.status == "Completed" },
                    totalRevenue = bookings
                        .filter { it.status == "Completed" }
                        .sumOf { it.cost }
                )
                
                updateDashboard(stats)
            }.onFailure {
                // Show default values on error
                updateDashboard(DashboardStats())
            }
        }
    }
    
    /**
     * Update dashboard UI with statistics
     */
    private fun updateDashboard(stats: DashboardStats) {
        tvPendingCount.text = stats.pendingReservations.toString()
        tvApprovedCount.text = stats.approvedReservations.toString()
        tvCompletedCount.text = stats.completedReservations.toString()
        tvTotalRevenue.text = "Rs.${String.format("%.2f", stats.totalRevenue)}"
    }
    
    /**
     * Reload stats when returning to activity
     */
    override fun onResume() {
        super.onResume()
        loadDashboardStats()
    }
}