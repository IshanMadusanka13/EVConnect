package com.evcharging.ui.users

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.LinearLayout
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.evcharging.R
import com.evcharging.repository.EVOwnerRepository
import com.evcharging.ui.auth.LoginActivity
import com.evcharging.utils.SharedPreferencesManager
import kotlinx.coroutines.launch
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class UserActivity : AppCompatActivity() {

    private lateinit var repository: EVOwnerRepository
    private lateinit var sharedPrefs: SharedPreferencesManager

    // TextViews for user details
    private lateinit var tvWelcome: TextView
    private lateinit var tvFullName: TextView
    private lateinit var tvNIC: TextView
    private lateinit var tvEmail: TextView
    private lateinit var tvPhone: TextView
    private lateinit var tvAddress: TextView
    private lateinit var tvStatus: TextView
    private lateinit var tvVehicleModel: TextView
    private lateinit var tvBatteryCapacity: TextView

    // Layouts
    private lateinit var btnLogout: LinearLayout
    private lateinit var btnEditProfile: LinearLayout
    private lateinit var vehicleCard: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_users)

        repository = EVOwnerRepository(this)
        sharedPrefs = SharedPreferencesManager(this)

        // Check if user is logged in
        if (!sharedPrefs.isLoggedIn()) {
            redirectToLogin()
            return
        }

        initializeViews()
        setupUserInfo()
        setupClickListeners()
    }

    private fun initializeViews() {
        // User info header views
        tvWelcome = findViewById(R.id.tvWelcome)

        // Profile detail views
        tvFullName = findViewById(R.id.tvFullName)
        tvNIC = findViewById(R.id.tvNIC)
        tvEmail = findViewById(R.id.tvEmail)
        tvPhone = findViewById(R.id.tvPhone)
        tvAddress = findViewById(R.id.tvAddress)
        tvStatus = findViewById(R.id.tvStatus)
        tvVehicleModel = findViewById(R.id.tvVehicleModel)
        tvBatteryCapacity = findViewById(R.id.tvBatteryCapacity)

        // Layouts
        btnLogout = findViewById(R.id.btnLogout)
        btnEditProfile = findViewById(R.id.btnEditProfile)
        vehicleCard = findViewById(R.id.vehicleCard)
    }

    private fun setupUserInfo() {
        val currentUserNIC = sharedPrefs.getCurrentUserNIC()

        // Display basic user info immediately
        tvWelcome.text = "Welcome!"

        // Set initial values for profile fields
        tvNIC.text = currentUserNIC
        tvFullName.text = "Loading..."
        tvEmail.text = "Loading..."
        tvPhone.text = "Loading..."
        tvAddress.text = "Loading..."
        tvStatus.text = "Loading..."

        // Load full user details from repository asynchronously
        loadUserDetails(currentUserNIC)
    }

    private fun loadUserDetails(nic: String) {
        lifecycleScope.launch {
            try {
                val result = repository.searchEVOwnerFlexible(nic)
                withContext(Dispatchers.Main) {
                    result.onSuccess { user ->
                        // Update header
                        tvWelcome.text = "Welcome, ${user.firstName}!"

                        // Update profile details
                        tvFullName.text = "${user.firstName} ${user.lastName}"
                        tvNIC.text = user.nic
                        tvEmail.text = user.email
                        tvPhone.text = user.phoneNumber ?: "Not provided"
                        tvAddress.text = user.address ?: "Not provided"
                        tvStatus.text = if (user.isActive == true) "Active" else "Inactive"

                        // Show vehicle information if available
                        user.vehicleModel?.let { model ->
                            vehicleCard.visibility = View.VISIBLE
                            tvVehicleModel.text = model
                            tvBatteryCapacity.text = user.batteryCapacity?.let {
                                if (it.contains("kWh")) it else "$it kWh"
                            } ?: "Not specified"
                        } ?: run {
                            vehicleCard.visibility = View.GONE
                        }

                    }.onFailure { error ->
                        tvWelcome.text = "Welcome!"
                        setErrorState()
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    tvWelcome.text = "Welcome!"
                    setErrorState()
                }
            }
        }
    }

    private fun setErrorState() {
        tvFullName.text = "Error loading"
        tvEmail.text = "Error loading"
        tvPhone.text = "Error loading"
        tvAddress.text = "Error loading"
        tvStatus.text = "Unknown"
        vehicleCard.visibility = View.GONE
    }

    private fun setupClickListeners() {
        // Edit Profile
        btnEditProfile.setOnClickListener {
            startActivity(Intent(this, UpdateUserActivity::class.java))
        }

        // Logout functionality
        btnLogout.setOnClickListener {
            logout()
        }
    }

    private fun logout() {
        sharedPrefs.clearLoginState()
        redirectToLogin()
    }

    private fun redirectToLogin() {
        val intent = Intent(this, LoginActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        startActivity(intent)
        finish()
    }

    override fun onResume() {
        super.onResume()
        // Refresh user data when returning from Edit Profile
        val currentUserNIC = sharedPrefs.getCurrentUserNIC()
        if (currentUserNIC.isNotEmpty()) {
            loadUserDetails(currentUserNIC)
        }
    }
}