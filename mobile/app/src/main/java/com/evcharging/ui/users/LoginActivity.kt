package com.evcharging.ui.auth

import android.content.Intent
import android.os.Bundle
import android.util.Patterns
import android.view.View
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.evcharging.MainActivity
import com.evcharging.R
import com.evcharging.repository.AuthRepository
import com.google.android.material.button.MaterialButton
import com.google.android.material.textfield.TextInputEditText
import com.google.android.material.textfield.TextInputLayout
import kotlinx.coroutines.launch

/**
 * Login Activity - Handles user authentication
 */
class LoginActivity : AppCompatActivity() {

    // UI Components
    private lateinit var tilEmail: TextInputLayout
    private lateinit var tilPassword: TextInputLayout
    private lateinit var etEmail: TextInputEditText
    private lateinit var etPassword: TextInputEditText
    private lateinit var btnLogin: MaterialButton
    private lateinit var btnGoogle: MaterialButton
    private lateinit var btnFacebook: MaterialButton

    // Repository
    private lateinit var authRepository: AuthRepository

    // Loading state
    private var isLoading = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_login)

        // Initialize repository
        authRepository = AuthRepository(this)

        // Check if user is already logged in
        if (authRepository.isLoggedIn()) {
            navigateToMain()
            return
        }

        // Initialize views
        initializeViews()

        // Setup click listeners
        setupClickListeners()

        // Pre-fill email if remembered
        preFillEmail()
    }

    private fun initializeViews() {
        tilEmail = findViewById(R.id.tilEmail)
        tilPassword = findViewById(R.id.tilPassword)
        etEmail = findViewById(R.id.etEmail)
        etPassword = findViewById(R.id.etPassword)
        btnLogin = findViewById(R.id.btnLogin)
    }

    private fun setupClickListeners() {
        // Login button
        btnLogin.setOnClickListener {
            if (validateInputs()) {
                performLogin()
            }
        }

        // Google login (placeholder)
        btnGoogle.setOnClickListener {
            Toast.makeText(this, "Google login coming soon!", Toast.LENGTH_SHORT).show()
        }

        // Facebook login (placeholder)
        btnFacebook.setOnClickListener {
            Toast.makeText(this, "Facebook login coming soon!", Toast.LENGTH_SHORT).show()
        }
    }

    private fun preFillEmail() {
        val session = authRepository.getUserSession()
        if (session?.isRemembered == true) {
            etEmail.setText(session.email)
        }
    }

    private fun validateInputs(): Boolean {
        var isValid = true

        // Validate email
        val email = etEmail.text.toString().trim()
        if (email.isEmpty()) {
            tilEmail.error = "Email is required"
            isValid = false
        } else if (!Patterns.EMAIL_ADDRESS.matcher(email).matches()) {
            tilEmail.error = "Invalid email format"
            isValid = false
        } else {
            tilEmail.error = null
        }

        // Validate password
        val password = etPassword.text.toString()
        if (password.isEmpty()) {
            tilPassword.error = "Password is required"
            isValid = false
        } else if (password.length < 6) {
            tilPassword.error = "Password must be at least 6 characters"
            isValid = false
        } else {
            tilPassword.error = null
        }

        return isValid
    }

    private fun performLogin() {
        if (isLoading) return

        val email = etEmail.text.toString().trim()
        val password = etPassword.text.toString()
        val rememberMe = true // You can add a checkbox for this

        setLoading(true)

        lifecycleScope.launch {
            val result = authRepository.login(email, password, rememberMe)

            result.onSuccess { loginResponse ->
                Toast.makeText(
                    this@LoginActivity,
                    "Welcome back, ${loginResponse.owner.firstName}!",
                    Toast.LENGTH_SHORT
                ).show()
                navigateToMain()
            }.onFailure { exception ->
                Toast.makeText(
                    this@LoginActivity,
                    exception.message ?: "Login failed",
                    Toast.LENGTH_LONG
                ).show()
                setLoading(false)
            }
        }
    }

    private fun setLoading(loading: Boolean) {
        isLoading = loading
        btnLogin.isEnabled = !loading
        btnGoogle.isEnabled = !loading
        btnFacebook.isEnabled = !loading
        etEmail.isEnabled = !loading
        etPassword.isEnabled = !loading

        if (loading) {
            btnLogin.text = "Logging in..."
        } else {
            btnLogin.text = "Login"
        }
    }

    private fun navigateToMain() {
        val intent = Intent(this, MainActivity::class.java)
        intent.flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        startActivity(intent)
        finish()
    }
}