package com.evcharging.ui.users

import android.app.DatePickerDialog
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.evcharging.R
import com.evcharging.models.EVOwner
import com.evcharging.repository.EVOwnerRepository
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
    private lateinit var radioChargerTypes: RadioGroup
    private lateinit var etPassword: EditText
    private lateinit var etConfirmPassword: EditText
    private lateinit var btnCreate: Button

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_create_user)

        repo = EVOwnerRepository(this)
        initializeViews()
        setupListeners()
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
        radioChargerTypes = findViewById(R.id.radioChargerTypes)
        etPassword = findViewById(R.id.etPassword)
        etConfirmPassword = findViewById(R.id.etConfirmPassword)
        btnCreate = findViewById(R.id.btnCreate)
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

    private fun showDatePicker() {
        val datePicker = DatePickerDialog(
            this,
            { _, year, month, day ->
                calendar.set(year, month, day)
                val dateFormat = SimpleDateFormat("yyyy-MM-dd", Locale.getDefault())
                etDateOfBirth.setText(dateFormat.format(calendar.time))
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

    private fun getSelectedChargerType(): String {
        return when (radioChargerTypes.checkedRadioButtonId) {
            R.id.radioAC -> "AC"
            R.id.radioDC -> "DC"
            R.id.radioACDC -> "AC,DC"
            R.id.radioAll -> "AC,DC,Super"
            else -> "AC,DC"
        }
    }

    private fun validateForm(): Boolean {
        var isValid = true

        // Clear previous errors
        clearErrors()

        // Required field validation
        if (etNIC.text.toString().trim().isEmpty()) {
            showError(etNIC, "NIC is required")
            isValid = false
        }

        if (etFirstName.text.toString().trim().isEmpty()) {
            showError(etFirstName, "First name is required")
            isValid = false
        }

        if (etLastName.text.toString().trim().isEmpty()) {
            showError(etLastName, "Last name is required")
            isValid = false
        }

        if (etEmail.text.toString().trim().isEmpty()) {
            showError(etEmail, "Email is required")
            isValid = false
        } else if (!isValidEmail(etEmail.text.toString())) {
            showError(etEmail, "Please enter a valid email address")
            isValid = false
        }

        if (etPhone.text.toString().trim().isEmpty()) {
            showError(etPhone, "Phone number is required")
            isValid = false
        }

        if (etVehicleModel.text.toString().trim().isEmpty()) {
            showError(etVehicleModel, "Vehicle model is required")
            isValid = false
        }

        if (etVehiclePlate.text.toString().trim().isEmpty()) {
            showError(etVehiclePlate, "Plate number is required")
            isValid = false
        }

        if (etBatteryCapacity.text.toString().trim().isEmpty()) {
            showError(etBatteryCapacity, "Battery capacity is required")
            isValid = false
        }

        // Password validation
        val password = etPassword.text.toString()
        val confirmPassword = etConfirmPassword.text.toString()

        if (password.isEmpty()) {
            showError(etPassword, "Password is required")
            isValid = false
        } else if (password.length < 6) {
            showError(etPassword, "Password must be at least 6 characters")
            isValid = false
        }

        if (confirmPassword.isEmpty()) {
            showError(etConfirmPassword, "Please confirm your password")
            isValid = false
        } else if (password != confirmPassword) {
            showError(etConfirmPassword, "Passwords do not match")
            isValid = false
        }

        return isValid
    }

    private fun isValidEmail(email: String): Boolean {
        return android.util.Patterns.EMAIL_ADDRESS.matcher(email).matches()
    }

    private fun showError(editText: EditText, message: String) {
        editText.error = message
        editText.requestFocus()
    }

    private fun clearErrors() {
        val editTexts = listOf(
            etNIC, etFirstName, etLastName, etEmail, etPhone,
            etVehicleModel, etVehiclePlate, etBatteryCapacity,
            etPassword, etConfirmPassword
        )
        editTexts.forEach { it.error = null }
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
        btnCreate.text = "Creating..."

        val localSuccess = repo.insertLocal(owner)
        if (localSuccess) {
            Toast.makeText(this, "EV Owner saved locally!", Toast.LENGTH_SHORT).show()

            // Sync to server in background
            scope.launch {
                val response = repo.syncWithServer(owner)
                if (response != null) {
                    Toast.makeText(this@CreateUserActivity, "Synced with server!", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    Toast.makeText(this@CreateUserActivity, "Saved locally but failed to sync with server", Toast.LENGTH_LONG).show()
                    btnCreate.isEnabled = true
                    btnCreate.text = "Create EV Owner"
                }
            }
        } else {
            Toast.makeText(this, "Error saving EV Owner", Toast.LENGTH_SHORT).show()
            btnCreate.isEnabled = true
            btnCreate.text = "Create EV Owner"
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        scope.cancel()
    }
}