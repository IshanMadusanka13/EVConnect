package com.evcharging.ui.users

import android.app.DatePickerDialog
import android.content.Intent
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.View
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import com.evcharging.R
import com.evcharging.models.EVOwner
import com.evcharging.repository.EVOwnerRepository
import com.evcharging.ui.auth.LoginActivity
import com.evcharging.utils.SharedPreferencesManager
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

/**
 * Activity for updating current user's profile
 */
class UpdateUserActivity : AppCompatActivity() {

    private lateinit var repository: EVOwnerRepository
    private lateinit var sharedPrefs: SharedPreferencesManager

    // User Info Header
    private lateinit var tvCurrentUser: TextView

    // Loading Section
    private lateinit var progressBarLoading: ProgressBar

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
    private lateinit var btnDeactivateAccount: LinearLayout
    private lateinit var btnDeleteAccount: LinearLayout

    // Validation states (excluding required validation)
    private var isFirstNameValid = true
    private var isLastNameValid = true
    private var isEmailValid = true
    private var isPhoneValid = true
    private var isVehicleModelValid = true
    private var isVehiclePlateValid = true
    private var isBatteryCapacityValid = true
    private var isPasswordValid = true
    private var isConfirmPasswordValid = true
    private var isDOBValid = true
    private var isGenderValid = true
    private var isVehicleTypeValid = true

    private val calendar = Calendar.getInstance()
    private var currentOwner: EVOwner? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_update_user)

        repository = EVOwnerRepository(this)
        sharedPrefs = SharedPreferencesManager(this)

        // Check if user is logged in
        if (!sharedPrefs.isLoggedIn()) {
            finish()
            return
        }

        initializeViews()
        setupListeners()
        setupRealTimeValidations()
        loadCurrentUserData()

        supportActionBar?.apply {
            title = "Update My Profile"
            setDisplayHomeAsUpEnabled(true)
        }
    }

    private fun initializeViews() {
        // User Info Header
        tvCurrentUser = findViewById(R.id.tvCurrentUser)

        // Loading Section
        progressBarLoading = findViewById(R.id.progressBarLoading)

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
        btnDeactivateAccount = findViewById(R.id.btnDeactivateAccount)
        btnDeleteAccount = findViewById(R.id.btnDeleteAccount)
        progressBarUpdate = findViewById(R.id.progressBarUpdate)

        // Initially show loading, hide form
        userDetailsContainer.visibility = View.GONE
        progressBarLoading.visibility = View.VISIBLE
    }

    private fun setupListeners() {
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

        btnDeactivateAccount.setOnClickListener {
            showDeactivateConfirmation()
        }

        btnDeleteAccount.setOnClickListener {
            showDeleteConfirmation()
        }

    }

    private fun setupRealTimeValidations() {
        // First Name Watcher (letters only, not required)
        etFirstName.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val name = s.toString().trim()
                isFirstNameValid = name.isEmpty() || name.matches(Regex("^[a-zA-Z ]+$"))
                updateError(etFirstName, !isFirstNameValid, getString(R.string.error_first_name_invalid))
                updateButtonState()
            }
        })

        // Last Name Watcher (letters only, not required)
        etLastName.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val name = s.toString().trim()
                isLastNameValid = name.isEmpty() || name.matches(Regex("^[a-zA-Z ]+$"))
                updateError(etLastName, !isLastNameValid, getString(R.string.error_last_name_invalid))
                updateButtonState()
            }
        })

        // Email Watcher (valid format if provided)
        etEmail.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val email = s.toString().trim()
                isEmailValid = email.isEmpty() || android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
                updateError(etEmail, !isEmailValid, getString(R.string.error_email_invalid))
                updateButtonState()
            }
        })

        // Phone Watcher (Sri Lankan format if provided)
        etPhone.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val phone = s.toString().trim()
                isPhoneValid = phone.isEmpty() || phone.matches(Regex("^0\\d{9}$"))
                updateError(etPhone, !isPhoneValid, getString(R.string.error_phone_invalid))
                updateButtonState()
            }
        })

        // Vehicle Model Watcher (alphanumeric if provided)
        etVehicleModel.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val model = s.toString().trim()
                isVehicleModelValid = model.isEmpty() || model.matches(Regex("^[a-zA-Z0-9 ]+$"))
                updateError(etVehicleModel, !isVehicleModelValid, getString(R.string.error_vehicle_model_invalid))
                updateButtonState()
            }
        })

        // Vehicle Plate Watcher (alphanumeric if provided)
        etVehiclePlate.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val plate = s.toString().trim().uppercase()
                isVehiclePlateValid = plate.isEmpty() || plate.matches(Regex("^[A-Z0-9/]+$"))
                updateError(etVehiclePlate, !isVehiclePlateValid, getString(R.string.error_vehicle_plate_invalid))
                updateButtonState()
            }
        })

        // Battery Capacity Watcher (positive decimal if provided)
        etBatteryCapacity.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val capacity = s.toString().trim()
                val valid = capacity.isEmpty() || (capacity.toDoubleOrNull() != null && capacity.toDouble() > 0)
                isBatteryCapacityValid = valid
                updateError(etBatteryCapacity, !valid, getString(R.string.error_battery_capacity_invalid))
                updateButtonState()
            }
        })

        // Password Watcher (min 6 chars if provided)
        etPassword.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val password = s.toString()
                isPasswordValid = password.isEmpty() || password.length >= 6
                updateError(etPassword, !isPasswordValid, getString(R.string.error_password_length))
                validateConfirmPassword()
            }
        })

        // Confirm Password Watcher
        etConfirmPassword.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                validateConfirmPassword()
            }
        })

        // Gender validation on text change (though it's set via dialog)
        etGender.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val gender = s.toString().trim()
                isGenderValid = gender.isEmpty() || gender in listOf("Male", "Female", "Other")
                updateError(etGender, !isGenderValid, getString(R.string.error_gender_invalid))
                updateButtonState()
            }
        })

        // Vehicle Type validation on text change
        etVehicleType.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val vType = s.toString().trim()
                isVehicleTypeValid = vType.isEmpty() || vType in listOf("Car", "Bike")
                updateError(etVehicleType, !isVehicleTypeValid, getString(R.string.error_vehicle_type_invalid))
                updateButtonState()
            }
        })
    }

    private fun validateConfirmPassword() {
        val password = etPassword.text.toString()
        val confirm = etConfirmPassword.text.toString()
        isConfirmPasswordValid = password.isEmpty() || (password == confirm && password.isNotEmpty())
        updateError(etConfirmPassword, !isConfirmPasswordValid, getString(R.string.error_passwords_mismatch))
        updateButtonState()
    }

    private fun updateError(editText: EditText, hasError: Boolean, message: String?) {
        if (hasError && message != null) {
            editText.error = message
        } else {
            editText.error = null
        }
    }

    private fun updateButtonState() {
        val allValid = isFirstNameValid && isLastNameValid && isEmailValid &&
                isPhoneValid && isVehicleModelValid && isVehiclePlateValid && isBatteryCapacityValid &&
                isPasswordValid && isConfirmPasswordValid && isDOBValid && isGenderValid && isVehicleTypeValid
        btnUpdate.isEnabled = allValid
        btnUpdate.alpha = if (allValid) 1.0f else 0.5f
    }

    private fun loadCurrentUserData() {
        val currentUserNIC = sharedPrefs.getCurrentUserNIC()

        if (currentUserNIC.isEmpty()) {
            Toast.makeText(this, "User not logged in", Toast.LENGTH_SHORT).show()
            finish()
            return
        }

        tvCurrentUser.text = "Loading profile for NIC: $currentUserNIC"

        lifecycleScope.launch {
            try {
                val result = repository.searchEVOwnerFlexible(currentUserNIC)

                result.onSuccess { owner ->
                    currentOwner = owner
                    populateUserDetails(owner)
                    userDetailsContainer.visibility = View.VISIBLE
                    progressBarLoading.visibility = View.GONE

                    tvCurrentUser.text = "Updating: ${owner.firstName} ${owner.lastName} (${owner.nic})"

                    Toast.makeText(
                        this@UpdateUserActivity,
                        "Profile loaded successfully!",
                        Toast.LENGTH_SHORT
                    ).show()
                }.onFailure { error ->
                    progressBarLoading.visibility = View.GONE
                    Toast.makeText(
                        this@UpdateUserActivity,
                        "Failed to load profile: ${error.message}",
                        Toast.LENGTH_LONG
                    ).show()
                    finish()
                }
            } catch (e: Exception) {
                progressBarLoading.visibility = View.GONE
                Toast.makeText(
                    this@UpdateUserActivity,
                    "Error loading profile: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
                finish()
            }
        }
    }

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
        val currentYear = calendar.get(Calendar.YEAR)
        val currentMonth = calendar.get(Calendar.MONTH)
        val currentDay = calendar.get(Calendar.DAY_OF_MONTH)

        val datePickerDialog = DatePickerDialog(
            this,
            { _, year, month, dayOfMonth ->
                val selectedDate = Calendar.getInstance().apply {
                    set(year, month, dayOfMonth)
                }

                // Validate age (must be at least 16 years old) - only if date is selected
                val today = Calendar.getInstance()
                val age = today.get(Calendar.YEAR) - year
                val isAdult = if (today.get(Calendar.MONTH) < month ||
                    (today.get(Calendar.MONTH) == month && today.get(Calendar.DAY_OF_MONTH) < dayOfMonth)) {
                    age - 1 >= 16
                } else {
                    age >= 16
                }

                if (!isAdult) {
                    Toast.makeText(this, getString(R.string.error_dob_underage), Toast.LENGTH_SHORT).show()
                    isDOBValid = false
                    updateError(etDateOfBirth, true, getString(R.string.error_dob_underage))
                } else {
                    isDOBValid = true
                    val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                    etDateOfBirth.setText(dateFormat.format(selectedDate.time))
                    updateError(etDateOfBirth, false, null)
                }
                updateButtonState()
            },
            currentYear - 30, // Default to 30 years ago
            currentMonth,
            currentDay
        )

        // Set max date to today
        datePickerDialog.datePicker.maxDate = System.currentTimeMillis()

        // Set min date to 100 years ago
        val minCalendar = Calendar.getInstance()
        minCalendar.add(Calendar.YEAR, -100)
        datePickerDialog.datePicker.minDate = minCalendar.timeInMillis

        datePickerDialog.show()
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
            Toast.makeText(this, "Profile not loaded", Toast.LENGTH_SHORT).show()
            return false
        }

        // Since real-time validation is in place, just check if all flags are true
        val allValid = isFirstNameValid && isLastNameValid && isEmailValid &&
                isPhoneValid && isVehicleModelValid && isVehiclePlateValid && isBatteryCapacityValid &&
                isPasswordValid && isConfirmPasswordValid && isDOBValid && isGenderValid && isVehicleTypeValid

        if (!allValid) {
            Toast.makeText(this, "Please fix validation errors", Toast.LENGTH_SHORT).show()
        }
        return allValid
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
                        .setTitle("Profile Updated Locally")
                        .setMessage("Your profile has been updated locally and will sync with server when online.")
                        .setPositiveButton("OK") { dialog, _ ->
                            dialog.dismiss()
                            finish()
                        }
                        .show()
                } else {
                    Toast.makeText(
                        this@UpdateUserActivity,
                        "Profile updated successfully!",
                        Toast.LENGTH_SHORT
                    ).show()
                    finish()
                }
            }.onFailure { error ->
                Toast.makeText(
                    this@UpdateUserActivity,
                    "Failed to update profile: ${error.message}",
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

    private fun showDeactivateConfirmation() {
        val owner = currentOwner ?: return

        // Check if already deactivated
        if (!owner.isActive) {
            Toast.makeText(this, "Your account is already deactivated", Toast.LENGTH_SHORT).show()
            return
        }

        AlertDialog.Builder(this)
            .setTitle("Deactivate Account")
            .setMessage(
                "Are you sure you want to deactivate your account?\n\n" +
                        "⚠️ Warning: \n" +
                        "• You won't be able to make new bookings\n" +
                        "• Your profile will be temporarily disabled\n" +
                        "• You can reactivate your account later by logging in\n\n" +
                        "This action will log you out immediately."
            )
            .setPositiveButton("Deactivate") { dialog, _ ->
                deactivateAccount()
                dialog.dismiss()
            }
            .setNegativeButton("Cancel") { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }

    private fun deactivateAccount() {
        val owner = currentOwner ?: return

        progressBarUpdate.visibility = View.VISIBLE
        btnDeactivateAccount.isEnabled = false

        lifecycleScope.launch {
            try {
                val result = repository.deactivateEVOwner(owner.nic)

                progressBarUpdate.visibility = View.GONE
                btnDeactivateAccount.isEnabled = true

                result.onSuccess { response ->
                    Toast.makeText(
                        this@UpdateUserActivity,
                        "Account deactivated successfully",
                        Toast.LENGTH_LONG
                    ).show()

                    // Logout user after deactivation
                    logoutUser()
                }.onFailure { error ->
                    Toast.makeText(
                        this@UpdateUserActivity,
                        "Failed to deactivate account: ${error.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                progressBarUpdate.visibility = View.GONE
                btnDeactivateAccount.isEnabled = true
                Toast.makeText(
                    this@UpdateUserActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    private fun showDeleteConfirmation() {
        val owner = currentOwner ?: return

        AlertDialog.Builder(this)
            .setTitle("Delete Account")
            .setMessage(
                "⚠️ DANGER: This action cannot be undone!\n\n" +
                        "Permanently deleting your account will:\n" +
                        "• Remove all your personal information\n" +
                        "• Delete all your booking history\n" +
                        "• Remove your vehicle details\n" +
                        "• Delete your account permanently\n\n" +
                        "Are you absolutely sure you want to proceed?\n\n" +
                        "Type \"DELETE\" to confirm:"
            )
            .setView(EditText(this).apply {
                hint = "Type DELETE to confirm"
            })
            .setPositiveButton("Delete") { dialog, _ ->
                val input = (dialog as AlertDialog).findViewById<EditText>(android.R.id.text1)?.text.toString()
                if (input.equals("DELETE", ignoreCase = true)) {
                    deleteAccount()
                } else {
                    Toast.makeText(this, "Confirmation text did not match", Toast.LENGTH_SHORT).show()
                }
                dialog.dismiss()
            }
            .setNegativeButton("Cancel") { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }

    private fun deleteAccount() {
        val owner = currentOwner ?: return

        progressBarUpdate.visibility = View.VISIBLE
        btnDeleteAccount.isEnabled = false

        lifecycleScope.launch {
            try {
                val result = repository.deleteEVOwner(owner.nic)

                progressBarUpdate.visibility = View.GONE
                btnDeleteAccount.isEnabled = true

                result.onSuccess { response ->
                    Toast.makeText(
                        this@UpdateUserActivity,
                        "Account deleted successfully",
                        Toast.LENGTH_LONG
                    ).show()

                    // Logout user after deletion
                    logoutUser()
                }.onFailure { error ->
                    Toast.makeText(
                        this@UpdateUserActivity,
                        "Failed to delete account: ${error.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                progressBarUpdate.visibility = View.GONE
                btnDeleteAccount.isEnabled = true
                Toast.makeText(
                    this@UpdateUserActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    private fun logoutUser() {
        sharedPrefs.clearLoginState()
        val intent = Intent(this, LoginActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
        }
        startActivity(intent)
        finish()
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }
}