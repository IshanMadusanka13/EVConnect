package com.evcharging.repository

import android.content.Context
import com.evcharging.api.RetrofitClient
import com.evcharging.database.DatabaseHelper
import com.evcharging.models.EVOwner
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class EVOwnerRepository(context: Context) {
    private val dbHelper = DatabaseHelper(context)
    private val api = RetrofitClient.apiService

    // --- LOCAL OPERATIONS ---

    fun insertLocal(owner: EVOwner): Boolean = dbHelper.insertEVOwner(owner) != -1L
    fun getLocalOwner(nic: String): EVOwner? = dbHelper.getEVOwnerByNIC(nic)
    fun updateLocal(owner: EVOwner): Boolean = dbHelper.updateEVOwner(owner) > 0
    fun deactivateLocal(nic: String): Boolean = dbHelper.deactivateEVOwner(nic) > 0
    fun getAllLocalOwners(): List<EVOwner> = dbHelper.getAllEVOwners()
    fun deleteLocal(nic: String): Boolean = dbHelper.deleteEVOwner(nic) > 0
    fun deleteAllLocal(): Boolean {
        return dbHelper.deleteAllEVOwners() > 0
    }
    // toggle activation status
    fun toggleActivationStatus(nic: String, isActive: Boolean): Boolean {
        val affectedRows = dbHelper.toggleEVOwnerStatus(nic, isActive)
        return affectedRows > 0
    }
 
    // --- REMOTE OPERATIONS ---
    suspend fun syncWithServer(owner: EVOwner) = withContext(Dispatchers.IO) {
        try {
            api.createEVOwner(owner)
        } catch (e: Exception) {
            null
        }
    }

    suspend fun updateRemote(owner: EVOwner) = withContext(Dispatchers.IO) {
        try {
            api.updateEVOwner(owner.nic, owner)
        } catch (e: Exception) {
            null
        }
    }

    suspend fun deactivateRemote(nic: String) = withContext(Dispatchers.IO) {
        try {
            api.deactivateEVOwner(nic)
        } catch (e: Exception) {
            null
        }
    }

    suspend fun activateRemote(nic: String) = withContext(Dispatchers.IO) {
        try {
            api.activateEVOwner(nic)
        } catch (e: Exception) {
            null
        }
    }

    suspend fun toggleStatusRemote(nic: String, isActive: Boolean) = withContext(Dispatchers.IO) {
        try {
            if (isActive) {
                api.activateEVOwner(nic)
            } else {
                api.deactivateEVOwner(nic)
            }
        } catch (e: Exception) {
            null
        }
    }

    suspend fun deleteRemote(nic: String) = withContext(Dispatchers.IO) {
        try {
            api.deleteEVOwner(nic)
        } catch (e: Exception) {
            null
        }
    }
}