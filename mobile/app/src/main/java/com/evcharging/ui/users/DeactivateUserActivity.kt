package com.evcharging.ui.users

import android.graphics.Color
import android.os.Bundle
import android.text.Editable
import android.text.TextWatcher
import android.view.LayoutInflater
import android.view.View
import android.view.ViewGroup
import android.widget.AdapterView
import android.widget.ArrayAdapter
import android.widget.Button
import android.widget.Spinner
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.cardview.widget.CardView
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.evcharging.R
import com.evcharging.models.EVOwner
import com.evcharging.repository.EVOwnerRepository
import com.google.android.material.textfield.TextInputEditText

class DeactivateUserActivity : AppCompatActivity() {
    private lateinit var repo: EVOwnerRepository
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: EVOwnerAdapter
    private var evOwners: List<EVOwner> = emptyList()
    private var filteredOwners: List<EVOwner> = emptyList()

    // UI Components for search and filters
    private lateinit var etSearch: TextInputEditText
    private lateinit var spinnerFilter: Spinner
    private lateinit var spinnerVehicleFilter: Spinner

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        try {
            setContentView(R.layout.activity_deactivate_user)
            repo = EVOwnerRepository(this)
            initializeViews()
            setupSpinners()
            setupSearchListener()
            loadAllOwners()
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, getString(R.string.toast_activity_error, e.message), Toast.LENGTH_LONG).show()
            finish()
        }
    }

    private fun initializeViews() {
        recyclerView = findViewById(R.id.recyclerView)
        etSearch = findViewById(R.id.etSearch)
        spinnerFilter = findViewById(R.id.spinnerFilter)
        spinnerVehicleFilter = findViewById(R.id.spinnerVehicleFilter)
    }

    private fun setupSpinners() {
        // Status filter spinner
        val filterOptions = resources.getStringArray(R.array.filter_status_options)
        val filterAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, filterOptions)
        filterAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerFilter.adapter = filterAdapter
        spinnerFilter.setSelection(0) // Default to All
        spinnerFilter.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                applyFilters()
            }
            override fun onNothingSelected(parent: AdapterView<*>) {}
        }

        // Vehicle type filter spinner
        val vehicleOptions = resources.getStringArray(R.array.filter_vehicle_options)
        val vehicleAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, vehicleOptions)
        vehicleAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerVehicleFilter.adapter = vehicleAdapter
        spinnerVehicleFilter.setSelection(0) // Default to All Vehicles
        spinnerVehicleFilter.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>, view: View?, position: Int, id: Long) {
                applyFilters()
            }
            override fun onNothingSelected(parent: AdapterView<*>) {}
        }
    }

    private fun setupSearchListener() {
        etSearch.addTextChangedListener(object : TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}
            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {}
            override fun afterTextChanged(s: Editable?) {
                applyFilters()
            }
        })
    }

    private fun loadAllOwners() {
        try {
            evOwners = repo.getAllLocalOwners()
            filteredOwners = evOwners
            adapter = EVOwnerAdapter(filteredOwners) { nic, newStatus ->
                showConfirmationDialogForOwner(nic, newStatus)
            }
            recyclerView.adapter = adapter
            recyclerView.layoutManager = LinearLayoutManager(this)
            applyFilters()
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, getString(R.string.toast_load_owners_error, e.message), Toast.LENGTH_LONG).show()
        }
    }

    private fun applyFilters() {
        var filtered = evOwners

        // Get the string arrays first
        val statusOptions = resources.getStringArray(R.array.filter_status_options)
        val vehicleOptions = resources.getStringArray(R.array.filter_vehicle_options)

        // Filter by status - use array indices
        val statusFilter = spinnerFilter.selectedItem.toString()
        if (statusFilter != statusOptions[0]) { // "All Users" is index 0
            filtered = filtered.filter { owner ->
                if (statusFilter == statusOptions[1]) owner.isActive // "Active Only" is index 1
                else !owner.isActive // "Inactive Only" is index 2
            }
        }

        // Filter by vehicle type
        val vehicleFilter = spinnerVehicleFilter.selectedItem.toString()
        if (vehicleFilter != vehicleOptions[0]) { // "All Vehicles" is index 0
            filtered = filtered.filter { owner ->
                owner.vehicleType == vehicleFilter
            }
        }

        // Search filter
        val searchText = etSearch.text.toString().trim().lowercase()
        if (searchText.isNotEmpty()) {
            filtered = filtered.filter { owner ->
                owner.nic.lowercase().contains(searchText) ||
                        "${owner.firstName} ${owner.lastName}".lowercase().contains(searchText) ||
                        owner.email.lowercase().contains(searchText)
            }
        }

        filteredOwners = filtered
        adapter.updateList(filteredOwners)
    }

    fun showConfirmationDialogForOwner(nic: String, newStatus: Boolean) {
        val title = if (newStatus) getString(R.string.dialog_activate_title) else getString(R.string.dialog_deactivate_title)
        val message = if (newStatus) {
            getString(R.string.dialog_activate_message)
        } else {
            getString(R.string.dialog_deactivate_message)
        }
        val positiveButton = if (newStatus) getString(R.string.button_activate) else getString(R.string.button_deactivate)

        AlertDialog.Builder(this)
            .setTitle(title)
            .setMessage(message)
            .setPositiveButton(positiveButton) { _, _ ->
                toggleUserStatusForOwner(nic, newStatus)
            }
            .setNegativeButton(getString(android.R.string.cancel)) { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }

    private fun toggleUserStatusForOwner(nic: String, newStatus: Boolean) {
        try {
            val success = repo.toggleActivationStatus(nic, newStatus)

            if (success) {
                val message = if (newStatus) getString(R.string.toast_user_activated) else getString(R.string.toast_user_deactivated)
                Toast.makeText(this, message, Toast.LENGTH_SHORT).show()

                // Refresh the list
                loadAllOwners()
            } else {
                Toast.makeText(this, getString(R.string.toast_update_failed), Toast.LENGTH_SHORT).show()
            }
        } catch (e: Exception) {
            e.printStackTrace()
            Toast.makeText(this, getString(R.string.toast_update_status_error, e.message), Toast.LENGTH_SHORT).show()
        }
    }

    private fun showToast(message: String) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show()
    }

    inner class EVOwnerAdapter(
        private var owners: List<EVOwner>,
        private val onToggleClick: (String, Boolean) -> Unit
    ) : RecyclerView.Adapter<EVOwnerAdapter.ViewHolder>() {

        fun updateList(newList: List<EVOwner>) {
            owners = newList
            notifyDataSetChanged()
        }

        inner class ViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
            val tvUserInfo: TextView = itemView.findViewById(R.id.tvUserInfoItem)
            val tvStatus: TextView = itemView.findViewById(R.id.tvStatusItem)
            val btnToggle: Button = itemView.findViewById(R.id.btnToggleItem)
        }

        override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): ViewHolder {
            val view = LayoutInflater.from(parent.context)
                .inflate(R.layout.item_ev_owner, parent, false)
            return ViewHolder(view)
        }

        override fun onBindViewHolder(holder: ViewHolder, position: Int) {
            val owner = owners[position]
            val userInfo = """
                👤 ${owner.firstName} ${owner.lastName} (NIC: ${owner.nic})
                📧 ${owner.email}
                📞 ${owner.phoneNumber}
                🏠 ${owner.address.ifEmpty { "N/A" }}
                👶 DOB: ${owner.dateOfBirth ?: "N/A"} | Gender: ${owner.gender}
                🚗 ${owner.vehicleType} - ${owner.vehicleModel} (${owner.vehiclePlateNumber})
                🔋 Battery: ${owner.batteryCapacity} kWh
                ⚡ Chargers: ${owner.compatibleChargerTypes}
            """.trimIndent()

            holder.tvUserInfo.text = userInfo

            val statusOptions = resources.getStringArray(R.array.status_options)
            val statusText = if (owner.isActive) statusOptions[0] else statusOptions[1] // "Active" and "Inactive"
            holder.tvStatus.text = "${getString(R.string.current_status)}: $statusText"

            // Set background color based on status
            try {
                if (owner.isActive) {
                    holder.tvStatus.setBackgroundResource(R.drawable.bg_status_active)
                } else {
                    holder.tvStatus.setBackgroundResource(R.drawable.bg_status_inactive)
                }
            } catch (e: Exception) {
                // Fallback if drawables don't exist
                val color = if (owner.isActive) {
                    resources.getColor(R.color.status_approved, null)
                } else {
                    resources.getColor(R.color.status_cancelled, null)
                }
                holder.tvStatus.setBackgroundColor(color)
            }

            holder.tvStatus.setTextColor(resources.getColor(android.R.color.white, null))

            if (owner.isActive) {
                // User is active - show deactivate option
                  holder.btnToggle.text = getString(R.string.button_deactivate)
                holder.btnToggle.backgroundTintList = resources.getColorStateList(R.color.status_cancelled, null)
            } else {
                // User is inactive - show activate option
                holder.btnToggle.text = getString(R.string.button_activate)
                holder.btnToggle.backgroundTintList = resources.getColorStateList(R.color.status_approved, null)
            }

            holder.btnToggle.setOnClickListener {
                onToggleClick(owner.nic, !owner.isActive)
            }
        }

        override fun getItemCount(): Int = owners.size
    }
}