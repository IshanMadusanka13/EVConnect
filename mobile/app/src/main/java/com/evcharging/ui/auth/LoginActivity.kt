package com.evcharging.ui.auth

import android.content.Intent
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.evcharging.R
import com.evcharging.repository.EVOwnerRepository
import com.evcharging.ui.users.CreateUserActivity
import com.evcharging.ui.users.UserActivity
import com.evcharging.utils.SharedPreferencesManager
import kotlinx.coroutines.launch

class LoginActivity : AppCompatActivity() {

    private lateinit var repository: EVOwnerRepository
    private lateinit var sharedPrefs: SharedPreferencesManager

    // UI Components - FIXED: Use correct types
    private lateinit var etNIC: EditText
    private lateinit var etPassword: EditText
    private lateinit var btnLogin: Button
    private lateinit var tvRegister: TextView // Changed from Button to TextView
    private lateinit var progressBar: ProgressBar
    private lateinit var cbRememberMe: CheckBox

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        repository = EVOwnerRepository(this)
        sharedPrefs = SharedPreferencesManager(this)

        initializeViews()
        setupListeners()
        checkRememberedUser()
    }

    private fun initializeViews() {
        etNIC = findViewById(R.id.etNIC)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
        tvRegister = findViewById(R.id.btnRegister) // This is a TextView, not Button
        progressBar = findViewById(R.id.progressBar)
        cbRememberMe = findViewById(R.id.cbRememberMe)
    }

    private fun setupListeners() {
        btnLogin.setOnClickListener {
            attemptLogin()
        }

        tvRegister.setOnClickListener {
            // Navigate to CreateUserActivity instead of showing toast
            val intent = Intent(this, CreateUserActivity::class.java)
            startActivity(intent)
        }
    }

    private fun checkRememberedUser() {
        val rememberedNIC = sharedPrefs.getRememberedNIC()
        if (rememberedNIC.isNotEmpty()) {
            etNIC.setText(rememberedNIC)
            cbRememberMe.isChecked = true
        }
    }

    private fun attemptLogin() {
        val nic = etNIC.text.toString().trim()
        val password = etPassword.text.toString().trim()

        if (nic.isEmpty()) {
            etNIC.error = "Please enter NIC"
            return
        }

        if (password.isEmpty()) {
            etPassword.error = "Please enter password"
            return
        }

        progressBar.visibility = View.VISIBLE
        btnLogin.isEnabled = false

        lifecycleScope.launch {
            val result = repository.authenticateUser(nic, password)

            progressBar.visibility = View.GONE
            btnLogin.isEnabled = true

            result.onSuccess { user ->
                // Save login state
                sharedPrefs.saveLoginState(user.nic, cbRememberMe.isChecked)

                Toast.makeText(
                    this@LoginActivity,
                    "Welcome back, ${user.firstName}!",
                    Toast.LENGTH_SHORT
                ).show()

                // Navigate to UserActivity
                val intent = Intent(this@LoginActivity, UserActivity::class.java).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
                }
                startActivity(intent)
                finish()
            }.onFailure { error ->
                Toast.makeText(
                    this@LoginActivity,
                    "Login failed: ${error.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }
}