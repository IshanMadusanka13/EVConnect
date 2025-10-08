package com.evcharging.ui.bookings

import android.graphics.Color
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import androidx.cardview.widget.CardView
import androidx.recyclerview.widget.RecyclerView
import com.evcharging.R
import com.evcharging.models.Booking
import java.text.SimpleDateFormat
import java.util.*

/**
 * Adapter class for booking RecyclerView
 * Displays booking information in card format
 */
class BookingAdapter(
    private var bookings: List<Booking>,
    private val onItemClick: (Booking) -> Unit,
    private val onCancelClick: (Booking) -> Unit
) : RecyclerView.Adapter<BookingAdapter.BookingViewHolder>() {
    
    /**
     * ViewHolder class for booking items
     */
    inner class BookingViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val cardView: CardView = itemView.findViewById(R.id.cardViewBooking)
        val tvBookingId: TextView = itemView.findViewById(R.id.tvBookingId)
        val tvStationId: TextView = itemView.findViewById(R.id.tvStationId)
        val tvDate: TextView = itemView.findViewById(R.id.tvDate)
        val tvTime: TextView = itemView.findViewById(R.id.tvTime)
        val tvChargerType: TextView = itemView.findViewById(R.id.tvChargerType)
        val tvStatus: TextView = itemView.findViewById(R.id.tvStatus)
        val tvCost: TextView = itemView.findViewById(R.id.tvCost)
        val btnCancel: Button = itemView.findViewById(R.id.btnCancel)
        
        /**
         * Bind booking data to view
         */
        fun bind(booking: Booking) {
            // Set booking ID (shortened)
            tvBookingId.text = "ID: ${booking.id.take(8).uppercase()}"
            
            // Set station ID
            tvStationId.text = "Station: ${booking.stationId}"
            
            // Format and set date
            tvDate.text = formatDate(booking.reservationDate)
            
            // Set time slot
            tvTime.text = "${booking.startTime} - ${booking.endTime}"
            
            // Set charger type with icon
            val chargerIcon = if (booking.chargerType == "DC Fast") "⚡" else "🔋"
            tvChargerType.text = "$chargerIcon ${booking.chargerType}"
            
            // Set status with color
            tvStatus.text = booking.status
            tvStatus.setBackgroundColor(getStatusColor(booking.status))
            tvStatus.setTextColor(Color.WHITE)
            
            // Set cost (show only for completed bookings)
            if (booking.status == "Completed") {
                tvCost.visibility = View.VISIBLE
                tvCost.text = "Cost: $${String.format("%.2f", booking.cost)}"
            } else {
                tvCost.visibility = View.GONE
            }
            
            // Show/hide cancel button based on status
            btnCancel.visibility = if (canCancel(booking.status)) View.VISIBLE else View.GONE
            
            // Set click listeners
            cardView.setOnClickListener {
                onItemClick(booking)
            }
            
            btnCancel.setOnClickListener {
                onCancelClick(booking)
            }
        }
    }
    
    /**
     * Create new ViewHolder
     */
    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): BookingViewHolder {
        val view = LayoutInflater.from(parent.context)
            .inflate(R.layout.item_booking, parent, false)
        return BookingViewHolder(view)
    }
    
    /**
     * Bind data to ViewHolder
     */
    override fun onBindViewHolder(holder: BookingViewHolder, position: Int) {
        holder.bind(bookings[position])
    }
    
    /**
     * Get total item count
     */
    override fun getItemCount(): Int = bookings.size
    
    /**
     * Update bookings list and refresh RecyclerView
     */
    fun updateBookings(newBookings: List<Booking>) {
        bookings = newBookings
        notifyDataSetChanged()
    }
    
    /**
     * Format date string for display
     */
    private fun formatDate(dateString: String): String {
        return try {
            val inputFormat = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            val outputFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
            val date = inputFormat.parse(dateString)
            date?.let { outputFormat.format(it) } ?: dateString
        } catch (e: Exception) {
            // Fallback: try simple date format
            try {
                val simpleFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                val outputFormat = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
                val date = simpleFormat.parse(dateString)
                date?.let { outputFormat.format(it) } ?: dateString
            } catch (e: Exception) {
                dateString
            }
        }
    }
    
    /**
     * Get color based on booking status
     */
    private fun getStatusColor(status: String): Int {
        return when (status) {
            "Pending" -> Color.parseColor("#F59E0B") // Amber
            "Approved" -> Color.parseColor("#3B82F6") // Blue
            "In Progress" -> Color.parseColor("#10B981") // Green
            "Completed" -> Color.parseColor("#6366F1") // Indigo
            "Cancelled", "Rejected" -> Color.parseColor("#EF4444") // Red
            else -> Color.parseColor("#6B7280") // Gray
        }
    }
    
    /**
     * Check if booking can be cancelled
     */
    private fun canCancel(status: String): Boolean {
        return status == "Pending" || status == "Approved"
    }
}