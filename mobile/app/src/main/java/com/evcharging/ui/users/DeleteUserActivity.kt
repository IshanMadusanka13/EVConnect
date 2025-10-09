package com.evcharging.ui.users

import android.os.Bundle
import android.util.Log
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.evcharging.R
import com.evcharging.repository.EVOwnerRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext

class DeleteUserActivity : AppCompatActivity() {

    private lateinit var repository: EVOwnerRepository
    private lateinit var etNIC: EditText
    private lateinit var btnSearch: Button
    private lateinit var btnDelete: Button
    private lateinit var btnDeleteAll: Button
    private lateinit var cardUserDetails: LinearLayout
    private lateinit var tvUserName: TextView
    private lateinit var tvUserEmail: TextView
    private lateinit var tvUserVehicle: TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var tvWarning: TextView

    private var currentUserNIC: String = ""

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_delete_user)

        repository = EVOwnerRepository(this)
        initializeViews()
        setupClickListeners()
    }

    private fun initializeViews() {
        etNIC = findViewById(R.id.etNIC)
        btnSearch = findViewById(R.id.btnSearch)
        btnDelete = findViewById(R.id.btnDeleteUser)
        btnDeleteAll = findViewById(R.id.btnDeleteAll) // Initialize the delete all button
        cardUserDetails = findViewById(R.id.cardUserDetails)
        tvUserName = findViewById(R.id.tvUserName)
        tvUserEmail = findViewById(R.id.tvUserEmail)
        tvUserVehicle = findViewById(R.id.tvUserVehicle)
        progressBar = findViewById(R.id.progressBar)
        tvWarning = findViewById(R.id.tvWarning)
    }

    private fun setupClickListeners() {
        btnSearch.setOnClickListener {
            searchUser()
        }

        btnDelete.setOnClickListener {
            showDeleteConfirmationDialog()
        }

        btnDeleteAll.setOnClickListener {
            showDeleteAllConfirmationDialog()
        }
    }

    private fun searchUser() {
        val nic = etNIC.text.toString().trim()

        if (nic.isEmpty()) {
            showToast("Please enter NIC")
            return
        }

        showProgress(true)

        CoroutineScope(Dispatchers.IO).launch {
            try {
                val user = repository.getLocalOwner(nic)

                withContext(Dispatchers.Main) {
                    showProgress(false)

                    if (user != null) {
                        currentUserNIC = user.nic
                        displayUserDetails(user)
                        cardUserDetails.visibility = LinearLayout.VISIBLE
                        btnDelete.visibility = Button.VISIBLE
                    } else {
                        showToast("User not found")
                        resetUserDetails()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    showProgress(false)
                    showToast("Error searching user: ${e.message}")
                }
            }
        }
    }

    private fun displayUserDetails(user: com.evcharging.models.EVOwner) {
        tvUserName.text = "Name: ${user.firstName} ${user.lastName}"
        tvUserEmail.text = "Email: ${user.email}"
        tvUserVehicle.text = "Vehicle: ${user.vehicleModel} (${user.vehiclePlateNumber})"

        // Show additional warning if user has active bookings
        checkActiveBookings(user.nic)
    }

    private fun checkActiveBookings(nic: String) {
        CoroutineScope(Dispatchers.IO).launch {
            // You might want to check if user has any active bookings
            // This is a placeholder - implement based on your booking structure
            val hasActiveBookings = false // Replace with actual check

            withContext(Dispatchers.Main) {
                if (hasActiveBookings) {
                    tvWarning.text = "⚠️ WARNING: This user has active bookings. Deleting will remove all booking history permanently!"
                }
            }
        }
    }

    private fun showDeleteConfirmationDialog() {
        AlertDialog.Builder(this)
            .setTitle("Confirm Deletion")
            .setMessage("Are you sure you want to permanently delete this user? This action cannot be undone.")
            .setPositiveButton("Delete") { dialog, which ->
                deleteUser()
            }
            .setNegativeButton("Cancel", null)
            .show()
    }

    private fun showDeleteAllConfirmationDialog() {
        AlertDialog.Builder(this)
            .setTitle("Delete All Users")
            .setMessage("⚠️ DANGER: This will delete ALL users from the database! This action cannot be undone and will remove all user data permanently.")
            .setPositiveButton("DELETE ALL") { dialog, which ->
                deleteAllUsers()
            }
            .setNegativeButton("Cancel", null)
            .setIcon(android.R.drawable.ic_dialog_alert)
            .show()
    }

    private fun deleteUser() {
        showProgress(true)

        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Try to delete from server first
                val remoteResponse = repository.deleteRemote(currentUserNIC)

                // Delete from local database regardless of server response
                val localSuccess = repository.deleteLocal(currentUserNIC)

                withContext(Dispatchers.Main) {
                    showProgress(false)

                    if (localSuccess) {
                        showToast("User deleted successfully")
                        resetForm()
                    } else {
                        showToast("Failed to delete user from local database")
                    }

                    // Log remote deletion result
                    if (remoteResponse?.isSuccessful == true) {
                        println("User deleted from server successfully")
                    } else {
                        println("Failed to delete user from server - data remains local only")
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    showProgress(false)
                    showToast("Error deleting user: ${e.message}")
                }
            }
        }
    }

    private fun deleteAllUsers() {
        showProgress(true)

        CoroutineScope(Dispatchers.IO).launch {
            try {
                // Get all users first if you need them for server deletion
                val allUsers = repository.getAllLocalOwners()

                // Delete from local database
                val success = repository.deleteAllLocal()

                withContext(Dispatchers.Main) {
                    showProgress(false)

                    if (success) {
                        showToast("All users deleted successfully")
                        resetForm()
                    } else {
                        showToast("Failed to delete all users")
                    }
                }

                // Optional: Also delete from server (be very careful with this!)
                allUsers.forEach { user ->
                    try {
                        repository.deleteRemote(user.nic)
                    } catch (e: Exception) {
                        Log.e("DeleteAll", "Failed to delete user ${user.nic} from server: ${e.message}")
                    }
                }

            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    showProgress(false)
                    showToast("Error deleting all users: ${e.message}")
                }
            }
        }
    }

    private fun resetForm() {
        etNIC.text.clear()
        cardUserDetails.visibility = LinearLayout.GONE
        btnDelete.visibility = Button.GONE
        currentUserNIC = ""
    }

    private fun resetUserDetails() {
        cardUserDetails.visibility = LinearLayout.GONE
        btnDelete.visibility = Button.GONE
        currentUserNIC = ""
    }

    private fun showProgress(show: Boolean) {
        progressBar.visibility = if (show) ProgressBar.VISIBLE else ProgressBar.GONE
        btnSearch.isEnabled = !show
        btnDelete.isEnabled = !show
        btnDeleteAll.isEnabled = !show
    }

    private fun showToast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }
}