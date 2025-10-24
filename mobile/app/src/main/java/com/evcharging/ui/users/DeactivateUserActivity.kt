package com.evcharging.ui.users

import android.os.Bundle
import android.view.View
import android.view.ViewGroup
import android.widget.*
import androidx.appcompat.app.AlertDialog
import androidx.appcompat.app.AppCompatActivity
import androidx.lifecycle.lifecycleScope
import androidx.recyclerview.widget.LinearLayoutManager
import androidx.recyclerview.widget.RecyclerView
import com.evcharging.R
import com.evcharging.models.EVOwner
import com.evcharging.repository.EVOwnerRepository
import kotlinx.coroutines.launch

/**
 * Activity for deactivating EV owner accounts
 */
class DeactivateUserActivity : AppCompatActivity() {

    private lateinit var repository: EVOwnerRepository

    // Search and Filter
    private lateinit var etSearch: EditText
    private lateinit var spinnerStatusFilter: Spinner
    private lateinit var spinnerVehicleFilter: Spinner
    private lateinit var btnSearch: Button

    // User List
    private lateinit var recyclerView: RecyclerView
    private lateinit var adapter: EVOwnerAdapter
    private lateinit var progressBar: ProgressBar
    private lateinit var emptyView: TextView

    private var allOwners = listOf<EVOwner>()
    private var filteredOwners = listOf<EVOwner>()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_deactivate_user)

        repository = EVOwnerRepository(this)
        initializeViews()
        setupRecyclerView()
        setupFilters()
        loadEVOwners()

        supportActionBar?.apply {
            title = "Manage Users"
            setDisplayHomeAsUpEnabled(true)
        }
    }

    private fun initializeViews() {
        etSearch = findViewById(R.id.etSearch)
        spinnerStatusFilter = findViewById(R.id.spinnerStatusFilter)
        spinnerVehicleFilter = findViewById(R.id.spinnerVehicleFilter)
        btnSearch = findViewById(R.id.btnSearch)
        recyclerView = findViewById(R.id.recyclerView)
        progressBar = findViewById(R.id.progressBar)
        emptyView = findViewById(R.id.emptyView)

        btnSearch.setOnClickListener {
            applyFilters()
        }
    }

    private fun setupRecyclerView() {
        adapter = EVOwnerAdapter(emptyList()) { owner ->
            showDeactivateDialog(owner)
        }
        recyclerView.layoutManager = LinearLayoutManager(this)
        recyclerView.adapter = adapter
    }

    private fun setupFilters() {
        // Status filter options - Use hardcoded strings
        val statusOptions = arrayOf("All Users", "Active Only", "Inactive Only")
        val statusAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, statusOptions)
        statusAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerStatusFilter.adapter = statusAdapter

        // Vehicle filter options - Use hardcoded strings
        val vehicleOptions = arrayOf("All Vehicles", "Car", "Bike")
        val vehicleAdapter = ArrayAdapter(this, android.R.layout.simple_spinner_item, vehicleOptions)
        vehicleAdapter.setDropDownViewResource(android.R.layout.simple_spinner_dropdown_item)
        spinnerVehicleFilter.adapter = vehicleAdapter

        // Fix: Add spinner listeners
        spinnerStatusFilter.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                applyFilters()
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        spinnerVehicleFilter.onItemSelectedListener = object : AdapterView.OnItemSelectedListener {
            override fun onItemSelected(parent: AdapterView<*>?, view: View?, position: Int, id: Long) {
                applyFilters()
            }
            override fun onNothingSelected(parent: AdapterView<*>?) {}
        }

        // Fix: Proper TextWatcher implementation
        etSearch.addTextChangedListener(object : android.text.TextWatcher {
            override fun beforeTextChanged(s: CharSequence?, start: Int, count: Int, after: Int) {}

            override fun onTextChanged(s: CharSequence?, start: Int, before: Int, count: Int) {
                // Filter as user types
                applyFilters()
            }

            override fun afterTextChanged(s: android.text.Editable?) {}
        })
    }

    private fun loadEVOwners() {
        progressBar.visibility = View.VISIBLE
        recyclerView.visibility = View.GONE
        emptyView.visibility = View.GONE

        lifecycleScope.launch {
            try {
                val result = repository.getAllEVOwners()

                progressBar.visibility = View.GONE

                result.onSuccess { owners ->
                    allOwners = owners
                    applyFilters()

                    if (owners.isEmpty()) {
                        emptyView.visibility = View.VISIBLE
                        emptyView.text = "No users found"
                        recyclerView.visibility = View.GONE
                    } else {
                        recyclerView.visibility = View.VISIBLE
                        emptyView.visibility = View.GONE
                    }
                }.onFailure { error ->
                    emptyView.visibility = View.VISIBLE
                    emptyView.text = "Failed to load users: ${error.message}"
                    recyclerView.visibility = View.GONE
                    Toast.makeText(
                        this@DeactivateUserActivity,
                        "Error: ${error.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                progressBar.visibility = View.GONE
                emptyView.visibility = View.VISIBLE
                emptyView.text = "Error loading users"
                recyclerView.visibility = View.GONE
                Toast.makeText(
                    this@DeactivateUserActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    private fun applyFilters() {
        val searchTerm = etSearch.text.toString().lowercase()
        val statusFilter = spinnerStatusFilter.selectedItem.toString()
        val vehicleFilter = spinnerVehicleFilter.selectedItem.toString()

        filteredOwners = allOwners.filter { owner ->
            // Search filter
            val matchesSearch = searchTerm.isEmpty() ||
                    owner.firstName.lowercase().contains(searchTerm) ||
                    owner.lastName.lowercase().contains(searchTerm) ||
                    owner.nic.lowercase().contains(searchTerm) ||
                    owner.email.lowercase().contains(searchTerm)

            // Status filter - Use hardcoded strings
            val matchesStatus = when (statusFilter) {
                "Active Only" -> owner.isActive
                "Inactive Only" -> !owner.isActive
                else -> true // "All Users"
            }

            // Vehicle filter - Use hardcoded strings
            val matchesVehicle = when (vehicleFilter) {
                "Car" -> owner.vehicleType.equals("Car", ignoreCase = true)
                "Bike" -> owner.vehicleType.equals("Bike", ignoreCase = true)
                else -> true // "All Vehicles"
            }

            matchesSearch && matchesStatus && matchesVehicle
        }

        adapter.updateOwners(filteredOwners)

        // Show/hide empty view
        if (filteredOwners.isEmpty()) {
            emptyView.visibility = View.VISIBLE
            emptyView.text = if (allOwners.isEmpty()) "No users found" else "No users match your filters"
            recyclerView.visibility = View.GONE
        } else {
            emptyView.visibility = View.GONE
            recyclerView.visibility = View.VISIBLE
        }
    }

    private fun showDeactivateDialog(owner: EVOwner) {
        // Only allow deactivation for active users
        if (!owner.isActive) {
            Toast.makeText(this, "User is already inactive", Toast.LENGTH_SHORT).show()
            return
        }

        val dialogMessage =
            "Are you sure you want to deactivate this user?\n\n" +
                    "⚠️ Warning: Deactivated users cannot make new bookings.\n\n" +
                    "User: ${owner.firstName} ${owner.lastName}\n" +
                    "NIC: ${owner.nic}\n" +
                    "Email: ${owner.email}"

        AlertDialog.Builder(this)
            .setTitle("Deactivate User")
            .setMessage(dialogMessage)
            .setPositiveButton("Deactivate") { dialog, _ ->
                deactivateUser(owner)
                dialog.dismiss()
            }
            .setNegativeButton("Cancel") { dialog, _ ->
                dialog.dismiss()
            }
            .show()
    }

    private fun deactivateUser(owner: EVOwner) {
        progressBar.visibility = View.VISIBLE

        lifecycleScope.launch {
            try {
                val result = repository.deactivateEVOwner(owner.nic)

                progressBar.visibility = View.GONE

                result.onSuccess { response ->
                    Toast.makeText(
                        this@DeactivateUserActivity,
                        response.message,
                        Toast.LENGTH_SHORT
                    ).show()

                    // Reload the list
                    loadEVOwners()
                }.onFailure { error ->
                    Toast.makeText(
                        this@DeactivateUserActivity,
                        "Failed to deactivate user: ${error.message}",
                        Toast.LENGTH_LONG
                    ).show()
                }
            } catch (e: Exception) {
                progressBar.visibility = View.GONE
                Toast.makeText(
                    this@DeactivateUserActivity,
                    "Error: ${e.message}",
                    Toast.LENGTH_LONG
                ).show()
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        finish()
        return true
    }

    override fun onResume() {
        super.onResume()
        loadEVOwners()
    }
}

/**
 * Adapter for displaying EV owners in a list
 */
class EVOwnerAdapter(
    private var owners: List<EVOwner>,
    private val onItemClick: (EVOwner) -> Unit
) : RecyclerView.Adapter<EVOwnerAdapter.EVOwnerViewHolder>() {

    inner class EVOwnerViewHolder(itemView: View) : RecyclerView.ViewHolder(itemView) {
        val tvName: TextView = itemView.findViewById(R.id.tvName)
        val tvNIC: TextView = itemView.findViewById(R.id.tvNIC)
        val tvEmail: TextView = itemView.findViewById(R.id.tvEmail)
        val tvVehicle: TextView = itemView.findViewById(R.id.tvVehicle)
        val tvStatus: TextView = itemView.findViewById(R.id.tvStatus)
        val cardView: androidx.cardview.widget.CardView = itemView.findViewById(R.id.cardView)
    }

    override fun onCreateViewHolder(parent: ViewGroup, viewType: Int): EVOwnerViewHolder {
        val view = android.view.LayoutInflater.from(parent.context)
            .inflate(R.layout.item_ev_owner, parent, false)
        return EVOwnerViewHolder(view)
    }

    override fun onBindViewHolder(holder: EVOwnerViewHolder, position: Int) {
        val owner = owners[position]

        holder.tvName.text = "${owner.firstName} ${owner.lastName}"
        holder.tvNIC.text = "NIC: ${owner.nic}"
        holder.tvEmail.text = owner.email
        holder.tvVehicle.text = "${owner.vehicleType} - ${owner.vehicleModel}"

        // Status with color
        holder.tvStatus.text = if (owner.isActive) "Active" else "Inactive"
        val statusColor = if (owner.isActive) {
            android.graphics.Color.parseColor("#10B981") // Green
        } else {
            android.graphics.Color.parseColor("#EF4444") // Red
        }
        holder.tvStatus.setBackgroundColor(statusColor)
        holder.tvStatus.setTextColor(android.graphics.Color.WHITE)

        // Only allow clicks on active users
        holder.cardView.isEnabled = owner.isActive
        holder.cardView.alpha = if (owner.isActive) 1.0f else 0.6f

        holder.cardView.setOnClickListener {
            if (owner.isActive) {
                onItemClick(owner)
            }
        }
    }

    override fun getItemCount(): Int = owners.size

    fun updateOwners(newOwners: List<EVOwner>) {
        owners = newOwners
        notifyDataSetChanged()
    }
}