package com.evcharging.ui.users

import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.evcharging.R
import com.evcharging.models.EVOwner
import com.evcharging.repository.EVOwnerRepository
import kotlinx.coroutines.launch

/**
 * Activity for deleting EV owner accounts
 */
class DeleteUserActivity : AppCompatActivity() {

    private lateinit var repository: EVOwnerRepository

    // Search Section
    private lateinit var etNIC: EditText
    private lateinit var btnSearch: Button
    private lateinit var progressBarSearch: ProgressBar

    // User Details Section
    private lateinit var userDetailsContainer: LinearLayout
    private lateinit var tvUserName: TextView
    private lateinit var tvUserEmail: TextView
    private lateinit var tvUserVehicle: TextView
    private lateinit var tvUserStatus: TextView
    private lateinit var tvWarning: TextView

    // Action Buttons
    private lateinit var btnDelete: Button
    private lateinit var progressBarDelete: ProgressBar

    private var currentOwner: EVOwner? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_delete_user)

        repository = EVOwnerRepository(this)
        initializeViews()
        setupListeners()

        supportActionBar?.apply {
            title = "Delete User"
            setDisplayHomeAsUpEnabled(true)
        }
    }

    private fun initializeViews() {
        // Search Section
        etNIC = findViewById(R.id.etNIC)
        btnSearch = findViewById(R.id.btnSearch)
        progressBarSearch = findViewById(R.id.progressBarSearch)

        // User Details Section
        userDetailsContainer = findViewById(R.id.userDetailsContainer)
        tvUserName = findViewById(R.id.tvUserName)
        tvUserEmail = findViewById(R.id.tvUserEmail)
        tvUserVehicle = findViewById(R.id.tvUserVehicle)
        tvUserStatus = findViewById(R.id.tvUserStatus)
        tvWarning = findViewById(R.id.tvWarning)

        // Action Buttons
        btnDelete = findViewById(R.id.btnDelete)
        progressBarDelete = findViewById(R.id.progressBarDelete)

        // Initially hide user details
        userDetailsContainer.visibility = View.GONE
        btnDelete.visibility = View.GONE // Hide delete button initially
    }

    private fun setupListeners() {
        btnSearch.setOnClickListener {
            searchUser()
        }

        btnDelete.setOnClickListener {
            showDeleteConfirmation()
        }
    }

    private fun searchUser() {
        val nic = etNIC.text.toString().trim()
        if (nic.isEmpty()) {
            etNIC.error = "Please enter NIC"
            return
        }

        progressBarSearch.visibility = View.VISIBLE
        btnSearch.isEnabled = false

        lifecycleScope.launch {
            val result = repository.searchEVOwnerFlexible(nic)

            progressBarSearch.visibility = View.GONE
            btnSearch.isEnabled = true

            result.onSuccess { owner ->
                currentOwner = owner
                displayUserDetails(owner)
                userDetailsContainer.visibility = View.VISIBLE
                btnDelete.visibility = View.VISIBLE // Show delete button when user is found
            }.onFailure { error ->
                Toast.makeText(
                    this@DeleteUserActivity,
                    "User not found: ${error.message}",
                    Toast.LENGTH_LONG
                ).show()
                userDetailsContainer.visibility = View.GONE
                btnDelete.visibility = View.GONE
            }
        }
    }

    private fun displayUserDetails(owner: EVOwner) {
        tvUserName.text = "Name: ${owner.firstName} ${owner.lastName}"
        tvUserEmail.text = "Email: ${owner.email}"
        tvUserVehicle.text = "Vehicle: ${owner.vehicleType} - ${owner.vehicleModel}"
        tvUserStatus.text = "Status: ${if (owner.isActive) "Active" else "Inactive"}"

        // Show warning if user is active (might have bookings)
        if (owner.isActive) {
            tvWarning.visibility = View.VISIBLE
            tvWarning.text = "⚠️ WARNING: This user is active. Deleting will remove all data permanently!"
        } else {
            tvWarning.visibility = View.GONE
        }
    }

    private fun showDeleteConfirmation() {
        val owner = currentOwner ?: return

        AlertDialog.Builder(this)
            .setTitle("Confirm Deletion")
            .setMessage(
                "Are you sure you want to permanently delete this user?\n\n" +
                        "This action cannot be undone. All user data and booking history will be permanently deleted.\n\n" +
                        "User: ${owner.firstName} ${owner.lastName}\n" +
                        "NIC: ${owner.nic}"
            )
            .setPositiveButton("Delete") { dialog, _ ->
                deleteUser(owner.nic)
                dialog.dismiss()
            }
            .setNegativeButton("Cancel") { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }

    private fun deleteUser(nic: String) {
        progressBarDelete.visibility = View.VISIBLE
        btnDelete.isEnabled = false

        lifecycleScope.launch {
            val result = repository.deleteEVOwner(nic)

            progressBarDelete.visibility = View.GONE
            btnDelete.isEnabled = true

            result.onSuccess { response ->
                Toast.makeText(
                    this@DeleteUserActivity,
                    response.message,
                    Toast.LENGTH_LONG
                ).show()

                if (response.message.contains("locally", ignoreCase = true)) {
                    AlertDialog.Builder(this@DeleteUserActivity)
                        .setTitle("Deleted Locally")
                        .setMessage("User has been deleted locally and will sync with server when online.")
                        .setPositiveButton("OK") { dialog, _ ->
                            dialog.dismiss()
                            resetForm()
                        }
                        .show()
                } else {
                    resetForm()
                }
            }.onFailure { error ->
                Toast.makeText(
                    this@DeleteUserActivity,
                    "Failed to delete user: ${error.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    private fun resetForm() {
        etNIC.setText("")
        userDetailsContainer.visibility = View.GONE
        btnDelete.visibility = View.GONE
        currentOwner = null
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }
}