package com.evcharging.ui.users

import android.app.DatePickerDialog
import android.os.Bundle
import android.text.Editable
import android.text.InputFilter
import android.text.Spanned
import android.text.TextWatcher
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.evcharging.R
import com.evcharging.models.EVOwner
import com.evcharging.repository.EVOwnerRepository
import com.google.android.material.textfield.TextInputEditText
import kotlinx.coroutines.*
import java.text.SimpleDateFormat
import java.util.*

class CreateUserActivity : AppCompatActivity() {
    private lateinit var repo: EVOwnerRepository
    private val scope = CoroutineScope(Dispatchers.Main)
    private val calendar = Calendar.getInstance()

    // UI Components
    private lateinit var etNIC: EditText
    private lateinit var etGender: EditText
    private lateinit var etFirstName: EditText
    private lateinit var etLastName: EditText
    private lateinit var etDateOfBirth: EditText
    private lateinit var etEmail: EditText
    private lateinit var etPhone: EditText
    private lateinit var etAddress: EditText
    private lateinit var etVehicleType: EditText
    private lateinit var etVehicleModel: EditText
    private lateinit var etVehiclePlate: EditText
    private lateinit var etBatteryCapacity: EditText
    private lateinit var radioAC: RadioButton
    private lateinit var radioDC: RadioButton
    private lateinit var radioACDC: RadioButton
    private lateinit var radioAll: RadioButton
    private lateinit var etPassword: TextInputEditText
    private lateinit var etConfirmPassword: TextInputEditText
    private lateinit var btnCreate: Button

    // Validation states
    private var isNICValid = false
    private var isFirstNameValid = false
    private var isLastNameValid = false
    private var isEmailValid = false
    private var isPhoneValid = false
    private var isVehicleModelValid = false
    private var isVehiclePlateValid = false
    private var isBatteryCapacityValid = false
    private var isPasswordValid = false
    private var isConfirmPasswordValid = false
    private var isDOBValid = false
    private var isGenderValid = false
    private var isVehicleTypeValid = false

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_user)

        repo = EVOwnerRepository(this)
        initializeViews()
        setupListeners()
        setupChargerTypes()
        setupRealTimeValidations()
    }

    private fun initializeViews() {
        etNIC = findViewById(R.id.etNIC)
        etGender = findViewById(R.id.etGender)
        etFirstName = findViewById(R.id.etFirstName)
        etLastName = findViewById(R.id.etLastName)
        etDateOfBirth = findViewById(R.id.etDateOfBirth)
        etEmail = findViewById(R.id.etEmail)
        etPhone = findViewById(R.id.etPhone)
        etAddress = findViewById(R.id.etAddress)
        etVehicleType = findViewById(R.id.etVehicleType)
        etVehicleModel = findViewById(R.id.etVehicleModel)
        etVehiclePlate = findViewById(R.id.etVehiclePlate)
        etBatteryCapacity = findViewById(R.id.etBatteryCapacity)
        radioAC = findViewById(R.id.radioAC)
        radioDC = findViewById(R.id.radioDC)
        radioACDC = findViewById(R.id.radioACDC)
        radioAll = findViewById(R.id.radioAll)
        etPassword = findViewById(R.id.etPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        btnCreate = findViewById(R.id.btnCreate)

        // Set initial button text
        btnCreate.text = getString(R.string.create_button_text)

        // NIC Input Filter: Limit to 12 chars, allow digits, and 'V' or 'X' only at position 9 (for old format)
        etNIC.filters = arrayOf(
            InputFilter.LengthFilter(12),
            object : InputFilter {
                override fun filter(
                    source: CharSequence?,
                    start: Int,
                    end: Int,
                    dest: Spanned?,
                    dstart: Int,
                    dend: Int
                ): CharSequence? {
                    if (source == null || source.isEmpty()) return null
                    val currentLength = dest?.length ?: 0
                    if (currentLength >= 12) return ""

                    for (i in start until end) {
                        val char = source[i]
                        if (char.isDigit()) continue
                        if (char.equals('v', ignoreCase = true) || char.equals('x', ignoreCase = true)) {
                            if (currentLength == 9) {
                                // Allow V/X/v/x only when adding the 10th character for old format
                                return char.toString().uppercase()
                            } else {
                                return ""
                            }
                        }
                        // Reject any other non-digit
                        return ""
                    }
                    return null
                }
            }
        )

        // Phone Input Filter: Limit to 10 digits only
        etPhone.filters = arrayOf(
            InputFilter.LengthFilter(10),
            InputFilter { source, _, _, dest, _, _ ->
                if (source != null && source.matches(Regex("\\d"))) null else ""
            }
        )
    }

    private fun setupListeners() {
        // Date of Birth Picker
        etDateOfBirth.setOnClickListener {
            showDatePicker()
        }

        // Gender Dropdown
        etGender.setOnClickListener {
            showGenderDialog()
        }

        // Vehicle Type Dropdown
        etVehicleType.setOnClickListener {
            showVehicleTypeDialog()
        }

        // Create Button
        btnCreate.setOnClickListener {
            createEVOwner()
        }
    }

    private fun setupChargerTypes() {
        val radios = listOf(radioAC, radioDC, radioACDC, radioAll)
        radioACDC.isChecked = true

        radios.forEach { rb ->
            rb.setOnCheckedChangeListener { _, isChecked ->
                if (isChecked) {
                    // Uncheck all others
                    radios.filter { it != rb }.forEach { it.isChecked = false }
                }
            }
        }
    }

    private fun setupRealTimeValidations() {
        // NIC Watcher (10 chars old: 9 digits + V/X, or 12 digits new)
        etNIC.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val nic = s.toString().trim().uppercase()
                isNICValid = when {
                    nic.length == 10 && nic.matches(Regex("^\\d{9}[VX]$")) -> true
                    nic.length == 12 && nic.matches(Regex("^\\d{12}$")) -> true
                    else -> false
                }
                updateError(etNIC, !isNICValid, when {
                    nic.isEmpty() -> getString(R.string.error_nic_required)
                    nic.length < 10 -> getString(R.string.error_nic_invalid_format)
                    nic.length > 12 -> getString(R.string.error_nic_too_long)
                    nic.length == 10 && !nic.matches(Regex("^\\d{9}[VX]$")) -> getString(R.string.error_nic_old_format)
                    nic.length == 12 && !nic.matches(Regex("^\\d{12}$")) -> getString(R.string.error_nic_new_format)
                    else -> getString(R.string.error_nic_general)
                })
                updateButtonState()
            }
        })

        // First Name Watcher (required, letters only)
        etFirstName.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val name = s.toString().trim()
                isFirstNameValid = name.isNotEmpty() && name.matches(Regex("^[a-zA-Z ]+$"))
                updateError(etFirstName, !isFirstNameValid, getString(R.string.error_first_name_required))
                updateButtonState()
            }
        })

        // Last Name Watcher (similar to first name)
        etLastName.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val name = s.toString().trim()
                isLastNameValid = name.isNotEmpty() && name.matches(Regex("^[a-zA-Z ]+$"))
                updateError(etLastName, !isLastNameValid, getString(R.string.error_last_name_required))
                updateButtonState()
            }
        })

        // Email Watcher
        etEmail.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val email = s.toString().trim()
                isEmailValid = email.isNotEmpty() && android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
                updateError(etEmail, !isEmailValid,
                    if (email.isEmpty()) getString(R.string.error_email_required)
                    else getString(R.string.error_email_invalid))
                updateButtonState()
            }
        })

        // Phone Watcher (Sri Lankan numbers: 10 digits starting with 0)
        etPhone.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val phone = s.toString().trim()
                isPhoneValid = phone.isNotEmpty() && phone.matches(Regex("^0\\d{9}$"))
                updateError(etPhone, !isPhoneValid,
                    if (phone.isEmpty()) getString(R.string.error_phone_required)
                    else getString(R.string.error_phone_invalid))
                updateButtonState()
            }
        })

        // Vehicle Model Watcher (required, alphanumeric)
        etVehicleModel.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val model = s.toString().trim()
                isVehicleModelValid = model.isNotEmpty() && model.matches(Regex("^[a-zA-Z0-9 ]+$"))
                updateError(etVehicleModel, !isVehicleModelValid, getString(R.string.error_vehicle_model_required))
                updateButtonState()
            }
        })

        // Vehicle Plate Watcher (required, alphanumeric)
        etVehiclePlate.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val plate = s.toString().trim().uppercase()
                isVehiclePlateValid = plate.isNotEmpty() && plate.matches(Regex("^[A-Z0-9/]+$"))
                updateError(etVehiclePlate, !isVehiclePlateValid, getString(R.string.error_vehicle_plate_required))
                updateButtonState()
            }
        })

        // Battery Capacity Watcher (required, positive decimal)
        etBatteryCapacity.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val capacity = s.toString().trim()
                val valid = capacity.isNotEmpty() && capacity.toDoubleOrNull() != null && capacity.toDouble() > 0
                isBatteryCapacityValid = valid
                updateError(etBatteryCapacity, !valid,
                    if (capacity.isEmpty()) getString(R.string.error_battery_capacity_required)
                    else getString(R.string.error_battery_capacity_invalid))
                updateButtonState()
            }
        })

        // Password Watcher (min 6 chars)
        etPassword.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val password = s.toString()
                isPasswordValid = password.length >= 6
                updateError(etPassword, !isPasswordValid,
                    if (password.isEmpty()) getString(R.string.error_password_required)
                    else getString(R.string.error_password_length))
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
                isGenderValid = gender in listOf("Male", "Female", "Other")
                updateError(etGender, !isGenderValid, getString(R.string.error_gender_required))
                updateButtonState()
            }
        })

        // Vehicle Type validation on text change
        etVehicleType.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                val vType = s.toString().trim()
                isVehicleTypeValid = vType in listOf("Car", "Bike")
                updateError(etVehicleType, !isVehicleTypeValid, getString(R.string.error_vehicle_type_required))
                updateButtonState()
            }
        })
    }

    private fun validateConfirmPassword() {
        val password = etPassword.text.toString()
        val confirm = etConfirmPassword.text.toString()
        isConfirmPasswordValid = password == confirm && password.isNotEmpty()
        updateError(etConfirmPassword, !isConfirmPasswordValid,
            if (confirm.isEmpty()) getString(R.string.error_confirm_password_required)
            else getString(R.string.error_passwords_mismatch))
        updateButtonState()
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

                // Validate age (must be at least 16 years old)
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
        val genders = resources.getStringArray(R.array.gender_options)
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.dialog_gender_title))
            .setItems(genders) { _, which ->
                etGender.setText(genders[which])
            }
            .show()
    }

    private fun showVehicleTypeDialog() {
        val vehicleTypes = resources.getStringArray(R.array.vehicle_type_options)
        AlertDialog.Builder(this)
            .setTitle(getString(R.string.dialog_vehicle_type_title))
            .setItems(vehicleTypes) { _, which ->
                etVehicleType.setText(vehicleTypes[which])
            }
            .show()
    }

    private fun getSelectedChargerType(): String {
        return when {
            radioAC.isChecked -> "AC"
            radioDC.isChecked -> "DC"
            radioACDC.isChecked -> "AC,DC"
            radioAll.isChecked -> "AC,DC,Super"
            else -> "AC,DC"
        }
    }

    private fun updateError(editText: EditText, hasError: Boolean, message: String?) {
        if (hasError && message != null) {
            editText.error = message
        } else {
            editText.error = null
        }
    }

    private fun updateButtonState() {
        val allValid = isNICValid && isFirstNameValid && isLastNameValid && isEmailValid &&
                isPhoneValid && isVehicleModelValid && isVehiclePlateValid && isBatteryCapacityValid &&
                isPasswordValid && isConfirmPasswordValid && isDOBValid && isGenderValid && isVehicleTypeValid
        btnCreate.isEnabled = allValid
        btnCreate.alpha = if (allValid) 1.0f else 0.5f
    }

    private fun validateForm(): Boolean {
        // Since real-time validation is in place, just check if all flags are true
        val allValid = isNICValid && isFirstNameValid && isLastNameValid && isEmailValid &&
                isPhoneValid && isVehicleModelValid && isVehiclePlateValid && isBatteryCapacityValid &&
                isPasswordValid && isConfirmPasswordValid && isDOBValid && isGenderValid && isVehicleTypeValid
        if (!allValid) {
            Toast.makeText(this, getString(R.string.toast_fix_errors), Toast.LENGTH_SHORT).show()
        }
        return allValid
    }

    private fun createEVOwner() {
        if (!validateForm()) return

        val owner = EVOwner(
            nic = etNIC.text.toString().trim(),
            firstName = etFirstName.text.toString().trim(),
            lastName = etLastName.text.toString().trim(),
            dateOfBirth = etDateOfBirth.text.toString().trim().takeIf { it.isNotEmpty() },
            gender = etGender.text.toString().trim(),
            email = etEmail.text.toString().trim(),
            phoneNumber = etPhone.text.toString().trim(),
            address = etAddress.text.toString().trim(),
            password = etPassword.text.toString().trim(),
            vehicleType = etVehicleType.text.toString().trim().ifEmpty { "Car" },
            vehicleModel = etVehicleModel.text.toString().trim(),
            vehiclePlateNumber = etVehiclePlate.text.toString().trim(),
            batteryCapacity = etBatteryCapacity.text.toString().trim(),
            compatibleChargerTypes = getSelectedChargerType()
        )

        // Show loading
        btnCreate.isEnabled = false
        btnCreate.text = getString(R.string.button_creating)

        val localSuccess = repo.insertLocal(owner)
        if (localSuccess) {
            Toast.makeText(this, getString(R.string.toast_saved_locally), Toast.LENGTH_SHORT).show()

            // Sync to server in background
            scope.launch {
                val response = repo.syncWithServer(owner)
                if (response != null && response.isSuccessful) {
                    Toast.makeText(this@CreateUserActivity, getString(R.string.toast_synced_server), Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    Toast.makeText(this@CreateUserActivity, getString(R.string.toast_sync_failed), Toast.LENGTH_LONG).show()
                    btnCreate.isEnabled = true
                    btnCreate.text = getString(R.string.create_button_text)
                }
            }
        } else {
            Toast.makeText(this, getString(R.string.toast_save_error), Toast.LENGTH_SHORT).show()
            btnCreate.isEnabled = true
            btnCreate.text = getString(R.string.create_button_text)
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }
}