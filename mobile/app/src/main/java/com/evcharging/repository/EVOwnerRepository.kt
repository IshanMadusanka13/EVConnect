//package com.evcharging.repository
//
//import android.content.Context
//import android.util.Log
//import com.evcharging.api.RetrofitClient
//import com.evcharging.database.DatabaseHelper
//import com.evcharging.models.*
//import kotlinx.coroutines.Dispatchers
//import kotlinx.coroutines.withContext
//
//class EVOwnerRepository(context: Context) {
//    private val dbHelper = DatabaseHelper(context)
//    private val api = RetrofitClient.apiService
//
//    // --- LOCAL OPERATIONS ---
//
//    fun insertLocal(owner: EVOwner): Boolean {
//        try {
//            println("=== ATTEMPTING LOCAL DATABASE INSERTION ===")
//            println("NIC: ${owner.nic}")
//            println("Name: ${owner.firstName} ${owner.lastName}")
//            println("Email: ${owner.email}")
//            println("Date of Birth: ${owner.dateOfBirth}")
//            println("Table status: ${dbHelper.debugEVOwnerTable()}")
//
//            val values = dbHelper.debugInsertEVOwner(owner)
//            println("ContentValues: $values")
//
//            val result = dbHelper.insertEVOwner(owner)
//            val success = result != -1L
//
//            println("Insert result: $result, Success: $success")
//            println("Table status after insert: ${dbHelper.debugEVOwnerTable()}")
//
//            return success
//        } catch (e: Exception) {
//            println("=== LOCAL DATABASE ERROR ===")
//            println("Error: ${e.message}")
//            e.printStackTrace()
//            return false
//        }
//    }
//
//    fun getLocalOwner(nic: String): EVOwner? = dbHelper.getEVOwnerByNIC(nic)
//    fun updateLocal(owner: EVOwner): Boolean {
//        return try {
//            val result = dbHelper.updateEVOwner(owner)
//            result > 0
//        } catch (e: Exception) {
//            Log.e("EVOwnerRepository", "Local update error: ${e.message}")
//            false
//        }
//    }
//    fun deactivateLocal(nic: String): Boolean = dbHelper.deactivateEVOwner(nic) > 0
//    fun getAllLocalOwners(): List<EVOwner> = dbHelper.getAllEVOwners()
//    fun deleteLocal(nic: String): Boolean = dbHelper.deleteEVOwner(nic) > 0
//    fun deleteAllLocal(): Boolean = dbHelper.deleteAllEVOwners() > 0
//
//    fun toggleActivationStatus(nic: String, isActive: Boolean): Boolean {
//        val affectedRows = dbHelper.toggleEVOwnerStatus(nic, isActive)
//        return affectedRows > 0
//    }
//
//    // --- REMOTE OPERATIONS ---
//
//    suspend fun getEVOwnerByNIC(nic: String): Result<EVOwner> = withContext(Dispatchers.IO) {
//        try {
//            val response = api.getEVOwnerByNIC(nic)
//            if (response.isSuccessful && response.body() != null) {
//                Result.success(response.body()!!)
//            } else {
//                Result.failure(Exception("User not found or server error: ${response.code()}"))
//            }
//        } catch (e: Exception) {
//            Result.failure(e)
//        }
//    }
//
//    // Update EV Owner method
//    suspend fun updateEVOwner(nic: String, updatedOwner: EVOwner): Result<MessageResponse> = withContext(Dispatchers.IO) {
//        try {
//            Log.d("EVOwnerRepository", "Starting update for NIC: $nic")
//
//            // Convert EVOwner to UpdateEVOwnerRequest - FIXED: Include password
//            val updateRequest = UpdateEVOwnerRequest(
//                firstName = updatedOwner.firstName,
//                lastName = updatedOwner.lastName,
//                dateOfBirth = updatedOwner.dateOfBirth,
//                gender = updatedOwner.gender,
//                email = updatedOwner.email,
//                phoneNumber = updatedOwner.phoneNumber,
//                address = updatedOwner.address,
//                vehicleType = updatedOwner.vehicleType,
//                vehicleModel = updatedOwner.vehicleModel,
//                vehiclePlateNumber = updatedOwner.vehiclePlateNumber,
//                batteryCapacity = updatedOwner.batteryCapacity,
//                compatibleChargerTypes = updatedOwner.compatibleChargerTypes
//            )
//
//            Log.d("EVOwnerRepository", "Sending update request: $updateRequest")
//
//            val response = api.updateEVOwner(nic, updateRequest)
//
//            if (response.isSuccessful) {
//                val responseBody = response.body()
//                Log.d("EVOwnerRepository", "Update successful: ${responseBody?.message}")
//
//                // Also update local database
//                val localSuccess = updateLocal(updatedOwner)
//                Log.d("EVOwnerRepository", "Local update result: $localSuccess")
//
//                if (responseBody != null) {
//                    Result.success(responseBody)
//                } else {
//                    Result.success(MessageResponse("Updated successfully"))
//                }
//            } else {
//                val errorBody = response.errorBody()?.string() ?: "Update failed: ${response.code()}"
//                Log.e("EVOwnerRepository", "Update failed: $errorBody")
//                Result.failure(Exception(errorBody))
//            }
//        } catch (e: Exception) {
//            Log.e("EVOwnerRepository", "Network error: ${e.message}")
//            // If network fails, update locally only
//            val localSuccess = updateLocal(updatedOwner)
//            if (localSuccess) {
//                Log.d("EVOwnerRepository", "Updated locally due to network failure")
//                Result.success(MessageResponse("Updated locally - will sync when online"))
//            } else {
//                Result.failure(Exception("Failed to update locally: ${e.message}"))
//            }
//        }
//    }
//
//    suspend fun syncWithServer(request: CreateEVOwnerRequest) = withContext(Dispatchers.IO) {
//        try {
//            println("=== SENDING REQUEST TO SERVER ===")
//            println("NIC: ${request.nic}")
//            println("Name: ${request.firstName} ${request.lastName}")
//            println("Email: ${request.email}")
//            println("Date of Birth: ${request.dateOfBirth}")
//            println("Full request: $request")
//
//            val response = api.createEVOwner(request)
//
//            println("=== SERVER RESPONSE ===")
//            println("Code: ${response.code()}")
//            println("Message: ${response.message()}")
//            println("Is Successful: ${response.isSuccessful}")
//
//            if (!response.isSuccessful) {
//                val errorBody = response.errorBody()?.string()
//                println("Error Body: $errorBody")
//            } else {
//                println("Success Body: ${response.body()}")
//            }
//
//            response
//        } catch (e: Exception) {
//            println("=== NETWORK ERROR ===")
//            println("Error: ${e.message}")
//            e.printStackTrace()
//            null
//        }
//    }
//
//    suspend fun deactivateRemote(nic: String) = withContext(Dispatchers.IO) {
//        try {
//            api.deactivateEVOwner(nic)
//        } catch (e: Exception) {
//            null
//        }
//    }
//
//    suspend fun activateRemote(nic: String) = withContext(Dispatchers.IO) {
//        try {
//            api.activateEVOwner(nic)
//        } catch (e: Exception) {
//            null
//        }
//    }
//
//    suspend fun toggleStatusRemote(nic: String, isActive: Boolean) = withContext(Dispatchers.IO) {
//        try {
//            if (isActive) {
//                api.activateEVOwner(nic)
//            } else {
//                api.deactivateEVOwner(nic)
//            }
//        } catch (e: Exception) {
//            null
//        }
//    }
//}

package com.evcharging.repository

import android.content.Context
import android.util.Log
import com.evcharging.api.RetrofitClient
import com.evcharging.database.DatabaseHelper
import com.evcharging.models.*
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

    // NEW: Search in local database only
    fun searchLocalOwner(nic: String): EVOwner? {
        Log.d("EVOwnerRepository", "Searching locally for NIC: $nic")
        return dbHelper.getEVOwnerByNIC(nic)
    }

    // NEW: Search in local database with detailed logging
    fun searchLocalOwnerWithLogging(nic: String): EVOwner? {
        Log.d("EVOwnerRepository", "=== LOCAL DATABASE SEARCH ===")
        Log.d("EVOwnerRepository", "Searching for NIC: $nic")

        val tableStatus = dbHelper.debugEVOwnerTable()
        Log.d("EVOwnerRepository", "Table status: $tableStatus")

        val owner = dbHelper.getEVOwnerByNIC(nic)

        if (owner != null) {
            Log.d("EVOwnerRepository", "✅ LOCAL SEARCH SUCCESS: Found user ${owner.firstName} ${owner.lastName}")
        } else {
            Log.d("EVOwnerRepository", "❌ LOCAL SEARCH: User not found in local database")
        }

        return owner
    }

    fun updateLocal(owner: EVOwner): Boolean {
        return try {
            val result = dbHelper.updateEVOwner(owner)
            result > 0
        } catch (e: Exception) {
            Log.e("EVOwnerRepository", "Local update error: ${e.message}")
            false
        }
    }

    fun deactivateLocal(nic: String): Boolean = dbHelper.deactivateEVOwner(nic) > 0
    fun getAllLocalOwners(): List<EVOwner> = dbHelper.getAllEVOwners()
    fun deleteLocal(nic: String): Boolean = dbHelper.deleteEVOwner(nic) > 0
    fun deleteAllLocal(): Boolean = dbHelper.deleteAllEVOwners() > 0

    fun toggleActivationStatus(nic: String, isActive: Boolean): Boolean {
        val affectedRows = dbHelper.toggleEVOwnerStatus(nic, isActive)
        return affectedRows > 0
    }

    // --- REMOTE OPERATIONS ---

    // NEW: Enhanced search that tries local first, then server
    suspend fun searchEVOwnerByNIC(nic: String, searchLocalFirst: Boolean = true): Result<EVOwner> = withContext(Dispatchers.IO) {
        Log.d("EVOwnerRepository", "=== STARTING SEARCH FOR NIC: $nic ===")

        // Option 1: Search local first (default)
        if (searchLocalFirst) {
            Log.d("EVOwnerRepository", "Search strategy: LOCAL → SERVER")

            // Step 1: Try local database first
            val localOwner = searchLocalOwnerWithLogging(nic)
            if (localOwner != null) {
                Log.d("EVOwnerRepository", "✅ Returning user from LOCAL database")
                return@withContext Result.success(localOwner)
            }

            // Step 2: If not found locally, try server
            Log.d("EVOwnerRepository", "User not found locally, trying SERVER...")
            return@withContext searchFromServer(nic)
        }
        // Option 2: Search server only
        else {
            Log.d("EVOwnerRepository", "Search strategy: SERVER ONLY")
            return@withContext searchFromServer(nic)
        }
    }

    // NEW: Search only from server
    private suspend fun searchFromServer(nic: String): Result<EVOwner> {
        return try {
            Log.d("EVOwnerRepository", "🔍 Searching SERVER for NIC: $nic")

            val response = api.getEVOwnerByNIC(nic)

            if (response.isSuccessful && response.body() != null) {
                val serverOwner = response.body()!!
                Log.d("EVOwnerRepository", "✅ SERVER SEARCH SUCCESS: Found ${serverOwner.firstName} ${serverOwner.lastName}")

                // Save to local database for future offline access
                Log.d("EVOwnerRepository", "💾 Saving server data to local database...")
                val saveSuccess = insertLocal(serverOwner)
                Log.d("EVOwnerRepository", "Local save result: $saveSuccess")

                Result.success(serverOwner)
            } else {
                val errorMsg = when {
                    response.code() == 404 -> "User with NIC $nic not found on server"
                    !response.isSuccessful -> "Server error: ${response.code()} - ${response.message()}"
                    else -> "User not found or server error"
                }
                Log.e("EVOwnerRepository", "❌ SERVER SEARCH FAILED: $errorMsg")
                Result.failure(Exception(errorMsg))
            }
        } catch (e: Exception) {
            Log.e("EVOwnerRepository", "🌐 NETWORK ERROR: ${e.message}")
            Result.failure(Exception("Network error: ${e.message}"))
        }
    }

    // NEW: Search with multiple strategies
    suspend fun searchEVOwnerFlexible(nic: String): Result<EVOwner> = withContext(Dispatchers.IO) {
        Log.d("EVOwnerRepository", "=== FLEXIBLE SEARCH FOR NIC: $nic ===")

        // Strategy 1: Try local first (fastest)
        val localOwner = searchLocalOwnerWithLogging(nic)
        if (localOwner != null) {
            Log.d("EVOwnerRepository", "✅ FLEXIBLE SEARCH: Found in LOCAL database")
            return@withContext Result.success(localOwner)
        }

        // Strategy 2: Try server
        Log.d("EVOwnerRepository", "🔍 FLEXIBLE SEARCH: Trying SERVER...")
        val serverResult = searchFromServer(nic)

        if (serverResult.isSuccess) {
            Log.d("EVOwnerRepository", "✅ FLEXIBLE SEARCH: Found in SERVER")
            return@withContext serverResult
        }

        // Strategy 3: Final fallback
        Log.e("EVOwnerRepository", "❌ FLEXIBLE SEARCH: User not found in LOCAL or SERVER")
        Result.failure(Exception("User with NIC $nic not found in local database or server"))
    }

    // Keep the old method for backward compatibility (server only)
    suspend fun getEVOwnerByNIC(nic: String): Result<EVOwner> = withContext(Dispatchers.IO) {
        Log.d("EVOwnerRepository", "📡 LEGACY SEARCH: Server-only search for NIC: $nic")
        searchFromServer(nic)
    }

    // Update EV Owner method
    suspend fun updateEVOwner(nic: String, updatedOwner: EVOwner): Result<MessageResponse> = withContext(Dispatchers.IO) {
        try {
            Log.d("EVOwnerRepository", "=== STARTING UPDATE FOR NIC: $nic ===")

            // Step 1: Update locally first (for offline support)
            Log.d("EVOwnerRepository", "Step 1: Updating local database...")
            val localSuccess = updateLocal(updatedOwner)

            if (!localSuccess) {
                Log.e("EVOwnerRepository", "❌ LOCAL UPDATE FAILED")
                return@withContext Result.failure(Exception("Failed to update locally"))
            }

            Log.d("EVOwnerRepository", "✅ LOCAL UPDATE SUCCESS")

            // Step 2: Try to update on server
            Log.d("EVOwnerRepository", "Step 2: Attempting server update...")

            // Create update request WITHOUT password (since it's handled separately)
            val updateRequest = UpdateEVOwnerRequest(
                firstName = updatedOwner.firstName,
                lastName = updatedOwner.lastName,
                dateOfBirth = updatedOwner.dateOfBirth,
                gender = updatedOwner.gender,
                email = updatedOwner.email,
                phoneNumber = updatedOwner.phoneNumber,
                address = updatedOwner.address,
                vehicleType = updatedOwner.vehicleType,
                vehicleModel = updatedOwner.vehicleModel,
                vehiclePlateNumber = updatedOwner.vehiclePlateNumber,
                batteryCapacity = updatedOwner.batteryCapacity,
                compatibleChargerTypes = updatedOwner.compatibleChargerTypes
            )

            Log.d("EVOwnerRepository", "Sending update request: $updateRequest")

            val response = api.updateEVOwner(nic, updateRequest)

            if (response.isSuccessful) {
                val responseBody = response.body()
                Log.d("EVOwnerRepository", "✅ SERVER UPDATE SUCCESS: ${responseBody?.message}")
                Result.success(responseBody ?: MessageResponse("Updated successfully"))
            } else {
                val errorBody = response.errorBody()?.string() ?: "Server error: ${response.code()}"
                Log.e("EVOwnerRepository", "❌ SERVER UPDATE FAILED: $errorBody")
                // Still return success since local update worked
                Result.success(MessageResponse("Updated locally - will sync when online: $errorBody"))
            }
        } catch (e: Exception) {
            Log.e("EVOwnerRepository", "🌐 NETWORK ERROR: ${e.message}")
            // Return success since local update should have worked
            Result.success(MessageResponse("Updated locally - network error: ${e.message}"))
        }
    }

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

    suspend fun changePassword(nic: String, currentPassword: String, newPassword: String): Result<MessageResponse> = withContext(Dispatchers.IO) {
        try {
            Log.d("EVOwnerRepository", "Changing password for NIC: $nic")

            // First verify current password locally
            val localOwner = searchLocalOwner(nic)
            if (localOwner == null) {
                return@withContext Result.failure(Exception("User not found in local database"))
            }

            if (localOwner.password != currentPassword) {
                return@withContext Result.failure(Exception("Current password is incorrect"))
            }

            // Update password locally first
            val updatedOwner = localOwner.copy(password = newPassword)
            val localSuccess = updateLocal(updatedOwner)

            if (!localSuccess) {
                Log.e("EVOwnerRepository", "Failed to update password locally")
                return@withContext Result.failure(Exception("Failed to update password locally"))
            }

            Log.d("EVOwnerRepository", "✅ Password updated locally")

            // Then try to update on server using mobile-only endpoint
            val changePasswordRequest = ChangePasswordRequest(
                currentPassword = currentPassword,
                newPassword = newPassword
            )

            val response = api.changePasswordMobile(nic, changePasswordRequest)

            if (response.isSuccessful) {
                val responseBody = response.body()
                Log.d("EVOwnerRepository", "✅ Server password update successful: ${responseBody?.message}")
                Result.success(responseBody ?: MessageResponse("Password changed successfully"))
            } else {
                val errorBody = response.errorBody()?.string() ?: "Server error: ${response.code()}"
                Log.e("EVOwnerRepository", "❌ Server password update failed: $errorBody")
                // Still return success since local update worked
                Result.success(MessageResponse("Password changed locally - will sync when online"))
            }
        } catch (e: Exception) {
            Log.e("EVOwnerRepository", "🌐 Network error during password change: ${e.message}")
            // Return success since local update worked
            Result.success(MessageResponse("Password changed locally - network error: ${e.message}"))
        }
    }


}