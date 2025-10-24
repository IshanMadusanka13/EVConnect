package com.evcharging.utils

import android.content.Context
import android.content.SharedPreferences

class SharedPreferencesManager(context: Context) {

    private val sharedPreferences: SharedPreferences =
        context.getSharedPreferences("EVChargingPrefs", Context.MODE_PRIVATE)

    companion object {
        private const val KEY_IS_LOGGED_IN = "is_logged_in"
        private const val KEY_USER_NIC = "user_nic"
        private const val KEY_REMEMBER_ME = "remember_me"
        private const val KEY_REMEMBERED_NIC = "remembered_nic"
    }

    fun saveLoginState(nic: String, rememberMe: Boolean) {
        with(sharedPreferences.edit()) {
            putBoolean(KEY_IS_LOGGED_IN, true)
            putString(KEY_USER_NIC, nic)
            putBoolean(KEY_REMEMBER_ME, rememberMe)
            if (rememberMe) {
                putString(KEY_REMEMBERED_NIC, nic)
            } else {
                remove(KEY_REMEMBERED_NIC)
            }
            apply()
        }
    }

    fun clearLoginState() {
        with(sharedPreferences.edit()) {
            putBoolean(KEY_IS_LOGGED_IN, false)
            remove(KEY_USER_NIC)
            apply()
        }
    }

    fun isLoggedIn(): Boolean {
        return sharedPreferences.getBoolean(KEY_IS_LOGGED_IN, false)
    }

    fun getCurrentUserNIC(): String {
        return sharedPreferences.getString(KEY_USER_NIC, "") ?: ""
    }

    fun getRememberedNIC(): String {
        return sharedPreferences.getString(KEY_REMEMBERED_NIC, "") ?: ""
    }

    fun shouldRememberMe(): Boolean {
        return sharedPreferences.getBoolean(KEY_REMEMBER_ME, false)
    }
}