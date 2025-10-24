package com.evcharging.ui.users

import android.app.DatePickerDialog
import android.os.Bundle
import android.view.View
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.evcharging.R
import com.evcharging.models.EVOwner
import com.evcharging.repository.EVOwnerRepository
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

/**
 * Activity for updating existing EV owner profiles
 */
class UpdateUserActivity : AppCompatActivity() {

    private lateinit var repository: EVOwnerRepository

    // Search Section
    private lateinit var etSearchNIC: EditText
    private lateinit var btnSearch: Button
    private lateinit var progressBarSearch: ProgressBar

    // User Details Section
    private lateinit var userDetailsContainer: LinearLayout

    // Personal Information
    private lateinit var etFirstName: EditText
    private lateinit var etLastName: EditText
    private lateinit var etDateOfBirth: EditText
    private lateinit var etGender: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPhone: EditText
    private lateinit var etAddress: EditText

    // Vehicle Information
    private lateinit var etVehicleType: EditText
    private lateinit var etVehicleModel: EditText
    private lateinit var etVehiclePlate: EditText
    private lateinit var etBatteryCapacity: EditText
    private lateinit var radioGroupChargers: RadioGroup
    private lateinit var rbAC: RadioButton
    private lateinit var rbDC: RadioButton
    private lateinit var rbACDC: RadioButton
    private lateinit var rbAll: RadioButton

    // Account Security
    private lateinit var etPassword: EditText
    private lateinit var etConfirmPassword: EditText

    // Action Buttons
    private lateinit var btnUpdate: Button
    private lateinit var progressBarUpdate: ProgressBar

    private val calendar = Calendar.getInstance()
    private var currentOwner: EVOwner? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_update_user)

        repository = EVOwnerRepository(this)
        initializeViews()
        setupListeners()

        supportActionBar?.apply {
            title = "Update EV Owner"
            setDisplayHomeAsUpEnabled(true)
        }
    }

    private fun initializeViews() {
        // Search Section
        etSearchNIC = findViewById(R.id.etSearchNIC)
        btnSearch = findViewById(R.id.btnSearch)
        progressBarSearch = findViewById(R.id.progressBarSearch)

        // User Details Section
        userDetailsContainer = findViewById(R.id.userDetailsContainer)

        // Personal Information
        etFirstName = findViewById(R.id.etFirstName)
        etLastName = findViewById(R.id.etLastName)
        etDateOfBirth = findViewById(R.id.etDateOfBirth)
        etGender = findViewById(R.id.etGender)
        etEmail = findViewById(R.id.etEmail)
        etPhone = findViewById(R.id.etPhone)
        etAddress = findViewById(R.id.etAddress)

        // Vehicle Information
        etVehicleType = findViewById(R.id.etVehicleType)
        etVehicleModel = findViewById(R.id.etVehicleModel)
        etVehiclePlate = findViewById(R.id.etVehiclePlate)
        etBatteryCapacity = findViewById(R.id.etBatteryCapacity)
        radioGroupChargers = findViewById(R.id.radioGroupChargers)
        rbAC = findViewById(R.id.rbAC)
        rbDC = findViewById(R.id.rbDC)
        rbACDC = findViewById(R.id.rbACDC)
        rbAll = findViewById(R.id.rbAll)

        // Account Security
        etPassword = findViewById(R.id.etPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)

        // Action Buttons
        btnUpdate = findViewById(R.id.btnUpdate)
        progressBarUpdate = findViewById(R.id.progressBarUpdate)

        // Initially hide user details
        userDetailsContainer.visibility = View.GONE
    }

    private fun setupListeners() {
        // Search Button
        btnSearch.setOnClickListener {
            searchUser()
        }

        // Date of Birth Picker
        etDateOfBirth.setOnClickListener {
            showDatePicker()
        }

        // Gender Selection
        etGender.setOnClickListener {
            showGenderDialog()
        }

        // Vehicle Type Selection
        etVehicleType.setOnClickListener {
            showVehicleTypeDialog()
        }

        // Update Button
        btnUpdate.setOnClickListener {
            if (validateForm()) {
                updateEVOwner()
            }
        }
    }

//    private fun searchUser() {
//        val nic = etSearchNIC.text.toString().trim()
//        if (nic.isEmpty()) {
//            etSearchNIC.error = "Please enter NIC to search"
//            return
//        }
//
//        progressBarSearch.visibility = View.VISIBLE
//        btnSearch.isEnabled = false
//
//        lifecycleScope.launch {
//            val result = repository.getEVOwnerByNIC(nic)
//
//            progressBarSearch.visibility = View.GONE
//            btnSearch.isEnabled = true
//
//            result.onSuccess { owner ->
//                currentOwner = owner
//                populateUserDetails(owner)
//                userDetailsContainer.visibility = View.VISIBLE
//                Toast.makeText(
//                    this@UpdateUserActivity,
//                    "User found!",
//                    Toast.LENGTH_SHORT
//                ).show()
//            }.onFailure { error ->
//                Toast.makeText(
//                    this@UpdateUserActivity,
//                    "User not found: ${error.message}",
//                    Toast.LENGTH_LONG
//                ).show()
//                userDetailsContainer.visibility = View.GONE
//            }
//        }
//    }

    private fun populateUserDetails(owner: EVOwner) {
        // Personal Information
        etFirstName.setText(owner.firstName)
        etLastName.setText(owner.lastName)
        etDateOfBirth.setText(owner.dateOfBirth)
        etGender.setText(owner.gender)
        etEmail.setText(owner.email)
        etPhone.setText(owner.phoneNumber)
        etAddress.setText(owner.address)

        // Vehicle Information
        etVehicleType.setText(owner.vehicleType)
        etVehicleModel.setText(owner.vehicleModel)
        etVehiclePlate.setText(owner.vehiclePlateNumber)
        etBatteryCapacity.setText(owner.batteryCapacity)

        // Charger Types
        when {
            owner.compatibleChargerTypes.contains("AC") && owner.compatibleChargerTypes.contains("DC") -> {
                if (owner.compatibleChargerTypes.contains("Super")) {
                    rbAll.isChecked = true
                } else {
                    rbACDC.isChecked = true
                }
            }
            owner.compatibleChargerTypes.contains("DC") -> rbDC.isChecked = true
            else -> rbAC.isChecked = true
        }

        // Clear password fields
        etPassword.setText("")
        etConfirmPassword.setText("")
    }

    private fun showDatePicker() {
        val datePicker = DatePickerDialog(
            this,
            { _, year, month, dayOfMonth ->
                calendar.set(year, month, dayOfMonth)
                val sdf = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                etDateOfBirth.setText(sdf.format(calendar.time))
            },
            calendar.get(Calendar.YEAR),
            calendar.get(Calendar.MONTH),
            calendar.get(Calendar.DAY_OF_MONTH)
        )
        datePicker.show()
    }

    private fun showGenderDialog() {
        val genders = arrayOf("Male", "Female", "Other")
        AlertDialog.Builder(this)
            .setTitle("Select Gender")
            .setItems(genders) { _, which ->
                etGender.setText(genders[which])
            }
            .show()
    }

    private fun showVehicleTypeDialog() {
        val vehicleTypes = arrayOf("Car", "Bike")
        AlertDialog.Builder(this)
            .setTitle("Select Vehicle Type")
            .setItems(vehicleTypes) { _, which ->
                etVehicleType.setText(vehicleTypes[which])
            }
            .show()
    }

    private fun validateForm(): Boolean {
        if (currentOwner == null) {
            Toast.makeText(this, "Please search for a user first", Toast.LENGTH_SHORT).show()
            return false
        }

        // Name Validation
        if (etFirstName.text.toString().trim().isEmpty()) {
            etFirstName.error = "First name is required"
            return false
        }

        if (etLastName.text.toString().trim().isEmpty()) {
            etLastName.error = "Last name is required"
            return false
        }

        // Email Validation
        if (etEmail.text.toString().trim().isEmpty()) {
            etEmail.error = "Email is required"
            return false
        }

        if (!android.util.Patterns.EMAIL_ADDRESS.matcher(etEmail.text.toString().trim()).matches()) {
            etEmail.error = "Valid email is required"
            return false
        }

        // Phone Validation
        if (etPhone.text.toString().trim().isEmpty()) {
            etPhone.error = "Phone number is required"
            return false
        }

        // Vehicle Validation
        if (etVehicleModel.text.toString().trim().isEmpty()) {
            etVehicleModel.error = "Vehicle model is required"
            return false
        }

        if (etVehiclePlate.text.toString().trim().isEmpty()) {
            etVehiclePlate.error = "Vehicle plate is required"
            return false
        }

        if (etBatteryCapacity.text.toString().trim().isEmpty()) {
            etBatteryCapacity.error = "Battery capacity is required"
            return false
        }

        // Password Validation (optional)
        val password = etPassword.text.toString()
        val confirmPassword = etConfirmPassword.text.toString()

        if (password.isNotEmpty()) {
            if (password.length < 6) {
                etPassword.error = "Password must be at least 6 characters"
                return false
            }

            if (password != confirmPassword) {
                etConfirmPassword.error = "Passwords do not match"
                return false
            }
        }

        return true
    }

    private fun updateEVOwner() {
        val owner = currentOwner ?: return

        progressBarUpdate.visibility = View.VISIBLE
        btnUpdate.isEnabled = false

        val updatedOwner = owner.copy(
            firstName = etFirstName.text.toString().trim(),
            lastName = etLastName.text.toString().trim(),
            dateOfBirth = etDateOfBirth.text.toString().trim(),
            gender = etGender.text.toString().trim(),
            email = etEmail.text.toString().trim(),
            phoneNumber = etPhone.text.toString().trim(),
            address = etAddress.text.toString().trim(),
            password = if (etPassword.text.toString().isNotEmpty()) {
                etPassword.text.toString().trim()
            } else {
                owner.password
            },
            vehicleType = etVehicleType.text.toString().trim(),
            vehicleModel = etVehicleModel.text.toString().trim(),
            vehiclePlateNumber = etVehiclePlate.text.toString().trim(),
            batteryCapacity = etBatteryCapacity.text.toString().trim(),
            compatibleChargerTypes = getSelectedChargerTypes()
        )

        lifecycleScope.launch {
            val result = repository.updateEVOwner(owner.nic, updatedOwner)

            progressBarUpdate.visibility = View.GONE
            btnUpdate.isEnabled = true

            result.onSuccess { response ->
                Toast.makeText(
                    this@UpdateUserActivity,
                    response.message,
                    Toast.LENGTH_LONG
                ).show()

                if (response.message.contains("locally", ignoreCase = true)) {
                    AlertDialog.Builder(this@UpdateUserActivity)
                        .setTitle("Updated Locally")
                        .setMessage("EV Owner has been updated locally and will sync with server when online.")
                        .setPositiveButton("OK") { dialog, _ ->
                            dialog.dismiss()
                        }
                        .show()
                } else {
                    finish()
                }
            }.onFailure { error ->
                Toast.makeText(
                    this@UpdateUserActivity,
                    "Failed to update EV Owner: ${error.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    private fun getSelectedChargerTypes(): String {
        return when (radioGroupChargers.checkedRadioButtonId) {
            R.id.rbAC -> "AC"
            R.id.rbDC -> "DC"
            R.id.rbACDC -> "AC,DC"
            R.id.rbAll -> "AC,DC,Super"
            else -> "AC,DC"
        }
    }

    private fun searchUser() {
        val nic = etSearchNIC.text.toString().trim()
        if (nic.isEmpty()) {
            etSearchNIC.error = "Please enter NIC to search"
            return
        }

        progressBarSearch.visibility = View.VISIBLE
        btnSearch.isEnabled = false

        lifecycleScope.launch {
            // Use the new flexible search that tries local first, then server
            val result = repository.searchEVOwnerFlexible(nic)

            progressBarSearch.visibility = View.GONE
            btnSearch.isEnabled = true

            result.onSuccess { owner ->
                currentOwner = owner
                populateUserDetails(owner)
                userDetailsContainer.visibility = View.VISIBLE

                // Show where the user was found
                val localOwner = repository.searchLocalOwner(nic)
                val source = if (localOwner != null) "local database" else "server"

                Toast.makeText(
                    this@UpdateUserActivity,
                    "User found in $source!",
                    Toast.LENGTH_SHORT
                ).show()
            }.onFailure { error ->
                Toast.makeText(
                    this@UpdateUserActivity,
                    "User not found: ${error.message}",
                    Toast.LENGTH_LONG
                ).show()
                userDetailsContainer.visibility = View.GONE
            }
        }
    }

    // Alternative: Search local only (for testing)
    private fun searchUserLocalOnly() {
        val nic = etSearchNIC.text.toString().trim()
        if (nic.isEmpty()) {
            etSearchNIC.error = "Please enter NIC to search"
            return
        }

        // Search in local database only (synchronous, no need for coroutines)
        val owner = repository.searchLocalOwnerWithLogging(nic)

        if (owner != null) {
            currentOwner = owner
            populateUserDetails(owner)
            userDetailsContainer.visibility = View.VISIBLE
            Toast.makeText(this, "User found in local database!", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, "User not found in local database", Toast.LENGTH_LONG).show()
            userDetailsContainer.visibility = View.GONE
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }
}