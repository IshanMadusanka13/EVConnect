package com.evcharging.repository;

import android.annotation.SuppressLint
import android.content.Context;
import android.content.SharedPreferences;
import android.util.Log;
import com.evcharging.api.RetrofitClient;
import com.evcharging.models.*;
import kotlinx.coroutines.Dispatchers;
import kotlinx.coroutines.withContext;

/**
 * Repository class for authentication operations
 * Handles login, registration, and session management
 */
class AuthRepository(private val context: Context) {

    private val apiService = RetrofitClient.apiService
    private val prefs: SharedPreferences =
            context.getSharedPreferences("EVChargingPrefs", Context.MODE_PRIVATE)

    companion object {
        private const val TAG = "AuthRepository"
        private const val KEY_USER_NIC = "user_nic"
        private const val KEY_USER_EMAIL = "user_email"
        private const val KEY_USER_FIRST_NAME = "user_first_name"
        private const val KEY_USER_LAST_NAME = "user_last_name"
        private const val KEY_USER_TOKEN = "user_token"
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
        private const val KEY_REMEMBER_ME = "remember_me"
        private const val KEY_LOGIN_TIME = "login_time"
    }

    // ============ LOGIN OPERATIONS ============

    /**
     * Login user with email and password
     */
    @SuppressLint("SuspiciousIndentation")
    suspend fun login(email: String, password: String, rememberMe: Boolean): Result<LoginResponse> =
    withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "🔐 Attempting login for: $email")

            val request = LoginRequest(email, password)
            val response = apiService.login(request)

            Log.d(TAG, "Response Code: ${response.code()}")
            Log.d(TAG, "Is Successful: ${response.isSuccessful}")

            if (response.isSuccessful && response.body() != null) {
                val loginResponse = response.body()!!
                        Log.d(TAG, "✅ Login successful for: ${loginResponse.owner.firstName}")

                // Save user session
                saveUserSession(loginResponse, rememberMe)

                Result.success(loginResponse)
            } else {
                val errorBody = response.errorBody()?.string()
                val errorMessage = when (response.code()) {
                    401 -> "Invalid email or password"
                    403 -> "Your account has been deactivated. Please contact support."
                    404 -> "No account found with this email"
                        else -> "Login failed: ${response.message()}"
                }

                Log.e(TAG, "❌ Login failed: $errorMessage")
                Log.e(TAG, "Error body: $errorBody")
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Exception during login", e)
            val errorMessage = when {
                e.message?.contains("Unable to resolve host") == true ->
                "No internet connection. Please check your network."
                e.message?.contains("timeout") == true ->
                "Connection timeout. Please try again."
                    else -> "Login failed: ${e.message}"
            }
            Result.failure(Exception(errorMessage))
        }
    }

    /**
     * Register new user
     */
    suspend fun register(request: RegisterRequest): Result<EVOwnerResponse> =
    withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "📝 Attempting registration for: ${request.email}")

            val response = apiService.register(request)

            if (response.isSuccessful && response.body() != null) {
                val registerResponse = response.body()!!
                        Log.d(TAG, "✅ Registration successful: ${registerResponse.owner.firstName}")
                Result.success(registerResponse)
            } else {
                val errorBody = response.errorBody()?.string()
                val errorMessage = when (response.code()) {
                    400 -> "Invalid registration data. Please check all fields."
                    409 -> "An account with this email or NIC already exists"
                        else -> "Registration failed: ${response.message()}"
                }

                Log.e(TAG, "❌ Registration failed: $errorMessage")
                Log.e(TAG, "Error body: $errorBody")
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Exception during registration", e)
            Result.failure(Exception("Registration failed: ${e.message}"))
        }
    }

    /**
     * Request password reset
     */
    suspend fun forgotPassword(email: String): Result<ForgotPasswordResponse> =
    withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "🔑 Requesting password reset for: $email")

            val request = ForgotPasswordRequest(email)
            val response = apiService.forgotPassword(request)

            if (response.isSuccessful && response.body() != null) {
                Log.d(TAG, "✅ Password reset email sent")
                Result.success(response.body()!!)
            } else {
                val errorMessage = when (response.code()) {
                    404 -> "No account found with this email"
                        else -> "Failed to send reset email: ${response.message()}"
                }

                Log.e(TAG, "❌ Password reset failed: $errorMessage")
                Result.failure(Exception(errorMessage))
            }
        } catch (e: Exception) {
            Log.e(TAG, "❌ Exception during password reset", e)
            Result.failure(Exception("Failed to send reset email: ${e.message}"))
        }
    }

    /**
     * Logout user
     */
    suspend fun logout(): Result<Unit> =
    withContext(Dispatchers.IO) {
        try {
            Log.d(TAG, "🚪 Logging out user")

            // Optional: Call backend logout endpoint if available
            try {
                apiService.logout()
            } catch (e: Exception) {
                Log.w(TAG, "Backend logout failed, continuing with local logout", e)
            }

            // Clear local session
            clearUserSession()

            Log.d(TAG, "✅ Logout successful")
            Result.success(Unit)
        } catch (e: Exception) {
            Log.e(TAG, "❌ Exception during logout", e)
            // Still clear session even if there's an error
            clearUserSession()
            Result.failure(e)
        }
    }

    // ============ SESSION MANAGEMENT ============

    /**
     * Save user session to SharedPreferences
     */
    private fun saveUserSession(loginResponse: LoginResponse, rememberMe: Boolean) {
        prefs.edit().apply {
            putString(KEY_USER_NIC, loginResponse.owner.nic)
            putString(KEY_USER_EMAIL, loginResponse.owner.email)
            putString(KEY_USER_FIRST_NAME, loginResponse.owner.firstName)
            putString(KEY_USER_LAST_NAME, loginResponse.owner.lastName)
            putString(KEY_USER_TOKEN, loginResponse.token)
            putBoolean(KEY_IS_LOGGED_IN, true)
            putBoolean(KEY_REMEMBER_ME, rememberMe)
            putLong(KEY_LOGIN_TIME, System.currentTimeMillis())
            apply()
        }
        Log.d(TAG, "💾 User session saved")
    }

    /**
     * Get current user session
     */
    fun getUserSession(): UserSession? {
        val isLoggedIn = prefs.getBoolean(KEY_IS_LOGGED_IN, false)

        return if (isLoggedIn) {
            UserSession(
                    nic = prefs.getString(KEY_USER_NIC, "") ?: "",
                    email = prefs.getString(KEY_USER_EMAIL, "") ?: "",
                    firstName = prefs.getString(KEY_USER_FIRST_NAME, "") ?: "",
                    lastName = prefs.getString(KEY_USER_LAST_NAME, "") ?: "",
                    token = prefs.getString(KEY_USER_TOKEN, ""),
                    loginTime = prefs.getLong(KEY_LOGIN_TIME, 0),
                    isRemembered = prefs.getBoolean(KEY_REMEMBER_ME, false)
            )
        } else {
            null
        }
    }

    /**
     * Check if user is logged in
     */
    fun isLoggedIn(): Boolean {
        return prefs.getBoolean(KEY_IS_LOGGED_IN, false)
    }

    /**
     * Get user NIC
     */
    fun getUserNIC(): String? {
        return prefs.getString(KEY_USER_NIC, null)
    }

    /**
     * Get user email
     */
    fun getUserEmail(): String? {
        return prefs.getString(KEY_USER_EMAIL, null)
    }

    /**
     * Get auth token
     */
    fun getAuthToken(): String? {
        return prefs.getString(KEY_USER_TOKEN, null)
    }

    /**
     * Clear user session
     */
    private fun clearUserSession() {
        prefs.edit().apply {
            remove(KEY_USER_NIC)
            remove(KEY_USER_EMAIL)
            remove(KEY_USER_FIRST_NAME)
            remove(KEY_USER_LAST_NAME)
            remove(KEY_USER_TOKEN)
            putBoolean(KEY_IS_LOGGED_IN, false)
            remove(KEY_LOGIN_TIME)
            // Keep remember_me preference if user wants to be remembered
            apply()
        }
        Log.d(TAG, "🗑️ User session cleared")
    }

    /**
     * Update user profile in session
     */
    fun updateUserProfile(owner: EVOwner) {
        prefs.edit().apply {
            putString(KEY_USER_FIRST_NAME, owner.firstName)
            putString(KEY_USER_LAST_NAME, owner.lastName)
            putString(KEY_USER_EMAIL, owner.email)
            apply()
        }
        Log.d(TAG, "💾 User profile updated in session")
    }
}