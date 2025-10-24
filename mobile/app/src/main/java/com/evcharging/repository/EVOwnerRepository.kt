package com.evcharging.repository

import android.content.Context
import com.evcharging.api.RetrofitClient
import com.evcharging.database.DatabaseHelper
import com.evcharging.models.CreateEVOwnerRequest
import com.evcharging.models.EVOwner
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class EVOwnerRepository(context: Context) {
    private val dbHelper = DatabaseHelper(context)
    private val api = RetrofitClient.apiService

    // --- LOCAL OPERATIONS ---

    fun insertLocal(owner: EVOwner): Boolean {
        try {
            println("=== ATTEMPTING LOCAL DATABASE INSERTION ===")
            println("NIC: ${owner.nic}")
            println("Name: ${owner.firstName} ${owner.lastName}")
            println("Email: ${owner.email}")
            println("Date of Birth: ${owner.dateOfBirth}")
            println("Table status: ${dbHelper.debugEVOwnerTable()}")

            // Debug the ContentValues
            val values = dbHelper.debugInsertEVOwner(owner)
            println("ContentValues: $values")

            val result = dbHelper.insertEVOwner(owner)
            val success = result != -1L

            println("Insert result: $result, Success: $success")
            println("Table status after insert: ${dbHelper.debugEVOwnerTable()}")

            return success
        } catch (e: Exception) {
            println("=== LOCAL DATABASE ERROR ===")
            println("Error: ${e.message}")
            e.printStackTrace()
            return false
        }
    }
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
    suspend fun syncWithServer(request: CreateEVOwnerRequest) = withContext(Dispatchers.IO) {
        try {
            println("=== SENDING REQUEST TO SERVER ===")
            println("NIC: ${request.nic}")
            println("Name: ${request.firstName} ${request.lastName}")
            println("Email: ${request.email}")
            println("Date of Birth: ${request.dateOfBirth}")
            println("Full request: $request")

            val response = api.createEVOwner(request)

            println("=== SERVER RESPONSE ===")
            println("Code: ${response.code()}")
            println("Message: ${response.message()}")
            println("Is Successful: ${response.isSuccessful}")

            if (!response.isSuccessful) {
                val errorBody = response.errorBody()?.string()
                println("Error Body: $errorBody")
            } else {
                println("Success Body: ${response.body()}")
            }

            response
        } catch (e: Exception) {
            println("=== NETWORK ERROR ===")
            println("Error: ${e.message}")
            e.printStackTrace()
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

//    suspend fun deleteRemote(nic: String) = withContext(Dispatchers.IO) {
//        try {
//            api.deleteEVOwner(nic)
//        } catch (e: Exception) {
//            null
//        }
//    }
}