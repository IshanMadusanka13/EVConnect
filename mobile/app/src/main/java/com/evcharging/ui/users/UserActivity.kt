package com.evcharging.ui.users

import android.content.Intent
import android.os.Bundle
import android.widget.LinearLayout
import android.widget.TextView
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
    private lateinit var tvWelcome: TextView
    private lateinit var tvUserInfo: TextView
    private lateinit var btnLogout: LinearLayout

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
        tvUserInfo = findViewById(R.id.tvUserInfo)
        btnLogout = findViewById(R.id.btnLogout)

        // Your existing card buttons

        findViewById<LinearLayout>(R.id.btnUpdateUser).setOnClickListener {
            startActivity(Intent(this, UpdateUserActivity::class.java))
        }
        findViewById<LinearLayout>(R.id.btnDeactivateUser).setOnClickListener {
            startActivity(Intent(this, DeactivateUserActivity::class.java))
        }
        findViewById<LinearLayout>(R.id.btnDeleteUser).setOnClickListener {
            startActivity(Intent(this, DeleteUserActivity::class.java))
        }
    }

    private fun setupUserInfo() {
        val currentUserNIC = sharedPrefs.getCurrentUserNIC()

        // Display basic user info immediately
        tvWelcome.text = "Welcome!"
        tvUserInfo.text = "NIC: $currentUserNIC"

        // Load full user details from repository asynchronously
        loadUserDetails(currentUserNIC)
    }

    private fun loadUserDetails(nic: String) {
        lifecycleScope.launch {
            try {
                val result = repository.searchEVOwnerFlexible(nic)
                withContext(Dispatchers.Main) {
                    result.onSuccess { user ->
                        tvWelcome.text = "Welcome, ${user.firstName}!"
                        tvUserInfo.text = "${user.firstName} ${user.lastName}\n${user.email}\nNIC: ${user.nic}"
                    }.onFailure { error ->
                        tvWelcome.text = "Welcome!"
                        tvUserInfo.text = "NIC: $nic\n(User details not available: ${error.message})"
                    }
                }
            } catch (e: Exception) {
                withContext(Dispatchers.Main) {
                    tvWelcome.text = "Welcome!"
                    tvUserInfo.text = "NIC: $nic\n(Error loading details)"
                }
            }
        }
    }

    private fun setupClickListeners() {
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
}