package com.evcharging.ui.users

import android.app.DatePickerDialog
import android.os.Bundle
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import com.evcharging.R
import com.evcharging.models.EVOwner
import com.evcharging.repository.EVOwnerRepository
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import java.text.SimpleDateFormat
import java.util.*

class UpdateUserActivity : AppCompatActivity() {

    private lateinit var repo: EVOwnerRepository
    private val scope = CoroutineScope(Dispatchers.Main)
    private val calendar = Calendar.getInstance()
    private var currentOwner: EVOwner? = null

    // UI Components
    private lateinit var etNIC: EditText
    private lateinit var etSearch: Button
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
    private lateinit var btnUpdate: Button
    private lateinit var formContainer: LinearLayout

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_update_user)

        repo = EVOwnerRepository(this)
        initializeViews()
        setupListeners()

        // Initially hide the form
        formContainer.visibility = LinearLayout.GONE
    }

    private fun initializeViews() {
        etNIC = findViewById(R.id.etNIC)
        etSearch = findViewById(R.id.btnSearch)
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
        btnUpdate = findViewById(R.id.btnUpdate)
        formContainer = findViewById(R.id.formContainer)
    }

    private fun setupListeners() {
        // Search Button
        etSearch.setOnClickListener {
            searchUser()
        }

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

        // Update Button
        btnUpdate.setOnClickListener {
            updateEVOwner()
        }
    }

    private fun searchUser() {
        val nic = etNIC.text.toString().trim()
        if (nic.isEmpty()) {
            Toast.makeText(this, "Please enter NIC to search", Toast.LENGTH_SHORT).show()
            return
        }

        val owner = repo.getLocalOwner(nic)
        if (owner != null) {
            currentOwner = owner
            populateForm(owner)
            formContainer.visibility = LinearLayout.VISIBLE
            Toast.makeText(this, "User found!", Toast.LENGTH_SHORT).show()
        } else {
            Toast.makeText(this, "User not found with NIC: $nic", Toast.LENGTH_SHORT).show()
            formContainer.visibility = LinearLayout.GONE
        }
    }

    private fun populateForm(owner: EVOwner) {
        etFirstName.setText(owner.firstName)
        etLastName.setText(owner.lastName)
        etGender.setText(owner.gender)
        etDateOfBirth.setText(owner.dateOfBirth ?: "")
        etEmail.setText(owner.email)
        etPhone.setText(owner.phoneNumber)
        etAddress.setText(owner.address)
        etVehicleType.setText(owner.vehicleType)
        etVehicleModel.setText(owner.vehicleModel)
        etVehiclePlate.setText(owner.vehiclePlateNumber)
        etBatteryCapacity.setText(owner.batteryCapacity)

        // Set charger type radio button
        when (owner.compatibleChargerTypes) {
            "AC" -> radioChargerTypes.check(R.id.radioAC)
            "DC" -> radioChargerTypes.check(R.id.radioDC)
            "AC,DC,Super" -> radioChargerTypes.check(R.id.radioAll)
            else -> radioChargerTypes.check(R.id.radioACDC) // Default to AC,DC
        }

        // Clear password fields for security
        etPassword.setText("")
        etConfirmPassword.setText("")
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

        // Password validation (only if provided)
        val password = etPassword.text.toString()
        val confirmPassword = etConfirmPassword.text.toString()

        if (password.isNotEmpty()) {
            if (password.length < 6) {
                showError(etPassword, "Password must be at least 6 characters")
                isValid = false
            }

            if (password != confirmPassword) {
                showError(etConfirmPassword, "Passwords do not match")
                isValid = false
            }
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
            etFirstName, etLastName, etEmail, etPhone,
            etVehicleModel, etVehiclePlate, etBatteryCapacity,
            etPassword, etConfirmPassword
        )
        editTexts.forEach { it.error = null }
    }

    private fun updateEVOwner() {
        if (currentOwner == null) {
            Toast.makeText(this, "Please search for a user first", Toast.LENGTH_SHORT).show()
            return
        }

        if (!validateForm()) return

        val updatedOwner = currentOwner!!.copy(
            firstName = etFirstName.text.toString().trim(),
            lastName = etLastName.text.toString().trim(),
            dateOfBirth = etDateOfBirth.text.toString().trim().takeIf { it.isNotEmpty() },
            gender = etGender.text.toString().trim(),
            email = etEmail.text.toString().trim(),
            phoneNumber = etPhone.text.toString().trim(),
            address = etAddress.text.toString().trim(),
            vehicleType = etVehicleType.text.toString().trim().ifEmpty { "Car" },
            vehicleModel = etVehicleModel.text.toString().trim(),
            vehiclePlateNumber = etVehiclePlate.text.toString().trim(),
            batteryCapacity = etBatteryCapacity.text.toString().trim(),
            compatibleChargerTypes = getSelectedChargerType()
        ).apply {
            // Only update password if provided
            val newPassword = etPassword.text.toString().trim()
            if (newPassword.isNotEmpty()) {
                // In a real app, you'd hash the password
                // For now, we'll just store it as is
            }
        }

        // Show loading
        btnUpdate.isEnabled = false
        btnUpdate.text = "Updating..."

        val localSuccess = repo.updateLocal(updatedOwner)
        if (localSuccess) {
            Toast.makeText(this, "EV Owner updated locally!", Toast.LENGTH_SHORT).show()

            // Sync update to server in background
            scope.launch {
                val response = repo.updateRemote(updatedOwner)
                if (response != null) {
                    Toast.makeText(this@UpdateUserActivity, "Updated on server!", Toast.LENGTH_SHORT).show()
                    finish()
                } else {
                    Toast.makeText(this@UpdateUserActivity, "Updated locally but failed to sync with server", Toast.LENGTH_LONG).show()
                    btnUpdate.isEnabled = true
                    btnUpdate.text = "Update EV Owner"
                }
            }
        } else {
            Toast.makeText(this, "Error updating EV Owner", Toast.LENGTH_SHORT).show()
            btnUpdate.isEnabled = true
            btnUpdate.text = "Update EV Owner"
        }
    }

}