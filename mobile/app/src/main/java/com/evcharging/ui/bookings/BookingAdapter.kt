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
    private val onCancelClick: (Booking) -> Unit,
    private val onUpdateClick: (Booking) -> Unit
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
        val btnUpdate: Button = itemView.findViewById(R.id.btnUpdate)
        
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
            val chargerIcon = if (booking.chargerType == "DC") "⚡" else "🔋"
            tvChargerType.text = "$chargerIcon ${booking.chargerType}"
            
            // Set status with color
            tvStatus.text = booking.status
            tvStatus.setBackgroundColor(getStatusColor(booking.status))
            tvStatus.setTextColor(Color.WHITE)
            
            // Set cost (show only for completed bookings)
            if (booking.status == "Completed") {
                tvCost.visibility = View.VISIBLE
                tvCost.text = "Cost: Rs.${String.format("%.2f", booking.cost)}"
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
        val booking = bookings[position]

        // Existing binding code...
        holder.tvBookingId.text = "ID: ${booking.id.take(8)}"
        holder.tvStationId.text = "Station: ${booking.stationId}"
        holder.tvStatus.text = booking.status
        
        // Format date
        val date = SimpleDateFormat("MMM dd, yyyy", Locale.getDefault())
            .format(SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss", Locale.getDefault())
            .parse(booking.reservationDate)!!)
        holder.tvDate.text = "📅 $date"
        
        holder.tvTime.text = "⏰ ${booking.startTime} - ${booking.endTime}"
        holder.tvChargerType.text = "⚡ ${booking.chargerType}"

        holder.tvStatus.setBackgroundColor(getStatusColor(booking.status))
        holder.tvStatus.setTextColor(Color.WHITE)

        // Status color
        // val statusColor = when (booking.status) {
        //     "Pending" -> android.graphics.Color.parseColor("#FFFFFF")
        //     "Approved" -> android.graphics.Color.parseColor("#FFFFFF")
        //     "In Progress" -> android.graphics.Color.parseColor("#FFFFFF")
        //     "Completed" -> android.graphics.Color.parseColor("#FFFFFF")
        //     "Cancelled" -> android.graphics.Color.parseColor("#FFFFFF")
        //     "Rejected" -> android.graphics.Color.parseColor("#FFFFFF")
        //     else -> android.graphics.Color.parseColor("#6B7280")
        // }
        // holder.tvStatus.setTextColor(statusColor)

        // Show cost for completed bookings
        if (booking.status == "Completed") {
            holder.tvCost.visibility = View.VISIBLE
            holder.tvCost.text = "Cost: Rs.${booking.cost}"
        } else {
            holder.tvCost.visibility = View.GONE
        }

        // Show/hide buttons based on status and time
        val canUpdate = canUpdateBooking(booking)
        val canCancel = canCancelBooking(booking)

        holder.btnUpdate.visibility = if (canUpdate) View.VISIBLE else View.GONE
        holder.btnCancel.visibility = if (canCancel) View.VISIBLE else View.GONE

        // Click listeners
        holder.itemView.setOnClickListener { onItemClick(booking) }
        holder.btnCancel.setOnClickListener { onCancelClick(booking) }
        holder.btnUpdate.setOnClickListener { onUpdateClick(booking) }
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

    private fun canUpdateBooking(booking: Booking): Boolean {
        if (booking.status != "Pending") return false

        try {
            val reservationDateTime = parseDateTime(booking.reservationDate, booking.startTime)
            val hoursUntilReservation = (reservationDateTime.time - System.currentTimeMillis()) / (1000 * 60 * 60)
            return hoursUntilReservation >= 12
        } catch (e: Exception) {
            return false
        }
    }

    private fun canCancelBooking(booking: Booking): Boolean {
        if (booking.status in listOf("Completed", "Cancelled")) return false

        try {
            val reservationDateTime = parseDateTime(booking.reservationDate, booking.startTime)
            val hoursUntilReservation = (reservationDateTime.time - System.currentTimeMillis()) / (1000 * 60 * 60)
            return hoursUntilReservation >= 12
        } catch (e: Exception) {
            return false
        }
    }

    private fun parseDateTime(date: String, time: String): Date {
        val dateStr = if (date.contains('T')) date.split('T')[0] else date
        val dateTimeStr = "$dateStr $time"
        return SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.getDefault()).parse(dateTimeStr)!!
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