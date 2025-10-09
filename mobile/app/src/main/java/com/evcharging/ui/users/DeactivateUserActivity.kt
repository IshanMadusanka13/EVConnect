package com.evcharging.ui.users

import android.graphics.Color
import android.os.Bundle
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.evcharging.R
import com.evcharging.models.EVOwner
import com.evcharging.repository.EVOwnerRepository

class DeactivateUserActivity : AppCompatActivity() {
    private lateinit var repo: EVOwnerRepository
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: EVOwnerAdapter
    private var evOwners: List<EVOwner> = emptyList()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        try {
            setContentView(R.layout.activity_deactivate_user)
            repo = EVOwnerRepository(this)
            initializeViews()
            loadAllOwners()
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Error initializing activity: ${e.message}", Toast.LENGTH_LONG).show()
            finish()
        }
    }

    private fun initializeViews() {
        recyclerView = findViewById(R.id.recyclerView)
    }

    private fun loadAllOwners() {
        try {
            evOwners = repo.getAllLocalOwners()
            adapter = EVOwnerAdapter(evOwners, this)
            recyclerView.adapter = adapter
            recyclerView.layoutManager = LinearLayoutManager(this)
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Error loading owners: ${e.message}", Toast.LENGTH_LONG).show()
        }
    }

    fun showConfirmationDialogForOwner(nic: String, newStatus: Boolean) {
        val title = if (newStatus) "Activate User" else "Deactivate User"
        val message = if (newStatus) {
            "Are you sure you want to activate this user?\n\n✅ This will allow the user to make bookings again."
        } else {
            "Are you sure you want to deactivate this user?\n\n⚠️ Warning: Deactivated users cannot make new bookings."
        }
        val positiveButton = if (newStatus) "Activate" else "Deactivate"

        AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton(positiveButton) { _, _ ->
                toggleUserStatusForOwner(nic, newStatus)
            }
            .setNegativeButton("Cancel") { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }

    private fun toggleUserStatusForOwner(nic: String, newStatus: Boolean) {
        try {
            val success = repo.toggleActivationStatus(nic, newStatus)

            if (success) {
                val statusText = if (newStatus) "activated" else "deactivated"
                Toast.makeText(this, "User $statusText successfully", Toast.LENGTH_SHORT).show()

                // Refresh the list
                loadAllOwners()
            } else {
                Toast.makeText(this, "Failed to update user status", Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Error: ${e.message}", Toast.LENGTH_SHORT).show()
        }
    }

    private fun showToast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }

    inner class EVOwnerAdapter(
        private val owners: List<EVOwner>,
        private val activity: DeactivateUserActivity
    ) : RecyclerView.Adapter<EVOwnerAdapter.ViewHolder>() {

        inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val tvUserInfo: TextView = itemView.findViewById(R.id.tvUserInfoItem)
            val tvStatus: TextView = itemView.findViewById(R.id.tvStatusItem)
            val btnToggle: Button = itemView.findViewById(R.id.btnToggleItem)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_ev_owner, parent, false)
            return ViewHolder(view)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val owner = owners[position]
            val userInfo = """
                👤 Name: ${owner.firstName} ${owner.lastName}
                📧 Email: ${owner.email}
                📞 Phone: ${owner.phoneNumber}
                🚗 Vehicle: ${owner.vehicleModel} (${owner.vehiclePlateNumber})
            """.trimIndent()

            holder.tvUserInfo.text = userInfo

            val statusText = if (owner.isActive) "Active" else "Inactive"
            holder.tvStatus.text = "Current Status: $statusText"

            // Set background color based on status
            try {
                if (owner.isActive) {
                    holder.tvStatus.setBackgroundResource(R.drawable.bg_status_active)
                } else {
                    holder.tvStatus.setBackgroundResource(R.drawable.bg_status_inactive)
                }
            } catch (e: Exception) {
                // Fallback if drawables don't exist
                val color = if (owner.isActive) {
                    activity.resources.getColor(R.color.status_approved, null)
                } else {
                    activity.resources.getColor(R.color.status_cancelled, null)
                }
                holder.tvStatus.setBackgroundColor(color)
            }

            holder.tvStatus.setTextColor(activity.resources.getColor(android.R.color.white, null))

            if (owner.isActive) {
                // User is active - show deactivate option
                holder.btnToggle.text = "Deactivate User"
                holder.btnToggle.backgroundTintList = activity.resources.getColorStateList(R.color.status_cancelled, null)
            } else {
                // User is inactive - show activate option
                holder.btnToggle.text = "Activate User"
                holder.btnToggle.backgroundTintList = activity.resources.getColorStateList(R.color.status_approved, null)
            }

            holder.btnToggle.setOnClickListener {
                activity.showConfirmationDialogForOwner(owner.nic, !owner.isActive)
            }
        }

        override fun getItemCount(): Int = owners.size
    }
}