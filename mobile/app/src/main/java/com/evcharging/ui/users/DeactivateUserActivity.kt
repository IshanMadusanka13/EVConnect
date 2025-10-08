package com.evcharging.ui.users

import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import com.evcharging.R
import com.evcharging.repository.EVOwnerRepository
import com.google.android.material.textfield.TextInputEditText

class DeactivateUserActivity : AppCompatActivity() {
    private lateinit var repo: EVOwnerRepository
    private var currentUserStatus: Boolean? = null
    private var currentNIC: String = ""

    // UI Components
    private lateinit var etNIC: TextInputEditText
    private lateinit var btnSearch: Button
    private lateinit var btnToggleStatus: Button
    private lateinit var tvUserInfo: TextView
    private lateinit var tvCurrentStatus: TextView
    private lateinit var userInfoContainer: CardView
    private lateinit var toggleButtonCard: CardView  // Add this for the button's parent CardView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        try {
            setContentView(R.layout.activity_deactivate_user)
            repo = EVOwnerRepository(this)
            initializeViews()
            setupListeners()

            // Initially hide user info and toggle button
            userInfoContainer.visibility = View.GONE
            toggleButtonCard.visibility = View.GONE  // Hide the CardView, not just the button
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, "Error initializing activity: ${e.message}", Toast.LENGTH_LONG).show()
            finish()
        }
    }

    private fun initializeViews() {
        etNIC = findViewById(R.id.etNIC)
        btnSearch = findViewById(R.id.btnSearch)
        btnToggleStatus = findViewById(R.id.btnToggleStatus)
        tvUserInfo = findViewById(R.id.tvUserInfo)
        tvCurrentStatus = findViewById(R.id.tvCurrentStatus)
        userInfoContainer = findViewById(R.id.userInfoContainer)
        toggleButtonCard = findViewById(R.id.toggleButtonCard)  // Initialize the CardView
    }

    private fun setupListeners() {
        btnSearch.setOnClickListener {
            searchUser()
        }

        btnToggleStatus.setOnClickListener {
            currentUserStatus?.let { isActive ->
                showConfirmationDialog(isActive)
            }
        }
    }

    private fun searchUser() {
        val nic = etNIC.text.toString().trim()
        if (nic.isEmpty()) {
            showToast("Please enter NIC to search")
            return
        }

        try {
            val owner = repo.getLocalOwner(nic)
            if (owner != null) {
                currentNIC = nic
                currentUserStatus = owner.isActive
                displayUserInfo(owner)

                // Show both user info container AND toggle button card
                userInfoContainer.visibility = View.VISIBLE
                toggleButtonCard.visibility = View.VISIBLE  // Show the CardView

                updateButtonAppearance(owner.isActive)
            } else {
                showToast("User not found with NIC: $nic")

                // Hide both user info container AND toggle button card
                userInfoContainer.visibility = View.GONE
                toggleButtonCard.visibility = View.GONE  // Hide the CardView
            }
        } catch (e: Exception) {
            e.printStackTrace()
            showToast("Error searching user: ${e.message}")
        }
    }

    private fun displayUserInfo(owner: com.evcharging.models.EVOwner) {
        val userInfo = """
            User Information
            
            👤 Name: ${owner.firstName} ${owner.lastName}
            📧 Email: ${owner.email}
            📞 Phone: ${owner.phoneNumber}
            🚗 Vehicle: ${owner.vehicleModel} (${owner.vehiclePlateNumber})
        """.trimIndent()

        tvUserInfo.text = userInfo

        val statusText = if (owner.isActive) "Active" else "Inactive"
        tvCurrentStatus.text = "Current Status: $statusText"

        // Set background color based on status
        try {
            if (owner.isActive) {
                tvCurrentStatus.setBackgroundResource(R.drawable.bg_status_active)
            } else {
                tvCurrentStatus.setBackgroundResource(R.drawable.bg_status_inactive)
            }
        } catch (e: Exception) {
            // Fallback if drawables don't exist
            val color = if (owner.isActive) {
                resources.getColor(R.color.status_approved, null)
            } else {
                resources.getColor(R.color.status_cancelled, null)
            }
            tvCurrentStatus.setBackgroundColor(color)
        }

        tvCurrentStatus.setTextColor(resources.getColor(android.R.color.white, null))
    }

    private fun updateButtonAppearance(isActive: Boolean) {
        if (isActive) {
            // User is active - show deactivate option
            btnToggleStatus.text = "Deactivate User"
            btnToggleStatus.backgroundTintList = resources.getColorStateList(R.color.status_cancelled, null)
        } else {
            // User is inactive - show activate option
            btnToggleStatus.text = "Activate User"
            btnToggleStatus.backgroundTintList = resources.getColorStateList(R.color.status_approved, null)
        }
    }

    private fun showConfirmationDialog(isCurrentlyActive: Boolean) {
        val title = if (isCurrentlyActive) "Deactivate User" else "Activate User"
        val message = if (isCurrentlyActive) {
            "Are you sure you want to deactivate this user?\n\n⚠️ Warning: Deactivated users cannot make new bookings."
        } else {
            "Are you sure you want to activate this user?\n\n✅ This will allow the user to make bookings again."
        }
        val positiveButton = if (isCurrentlyActive) "Deactivate" else "Activate"

        AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton(positiveButton) { dialog, _ ->
                toggleUserStatus(!isCurrentlyActive)
                dialog.dismiss()
            }
            .setNegativeButton("Cancel") { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }

    private fun toggleUserStatus(newStatus: Boolean) {
        btnToggleStatus.isEnabled = false

        try {
            val success = repo.toggleActivationStatus(currentNIC, newStatus)

            if (success) {
                val statusText = if (newStatus) "activated" else "deactivated"
                showToast("User $statusText successfully")

                // Refresh the UI
                searchUser()
            } else {
                showToast("Failed to update user status")
            }
        } catch (e: Exception) {
            e.printStackTrace()
            showToast("Error: ${e.message}")
        } finally {
            btnToggleStatus.isEnabled = true
        }
    }

    private fun showToast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
}