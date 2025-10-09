package com.evcharging

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import android.widget.Button
import android.widget.TextView
import android.widget.Toast
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.lifecycle.lifecycleScope
import com.evcharging.models.DashboardStats
import com.evcharging.models.Station
import com.evcharging.repository.BookingRepository
import com.evcharging.ui.bookings.BookingListActivity
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.BitmapDescriptorFactory
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import kotlinx.coroutines.launch

private const val REQUEST_LOCATION_PERMISSION = 1001
private const val NEARBY_RADIUS_METERS = 10_000f // 10 km

/**
 * Main activity serving as the dashboard and entry point
 * Displays booking statistics, navigation options, and nearby charging stations map
 */
class MainActivity : AppCompatActivity(), OnMapReadyCallback {

    private lateinit var repository: BookingRepository

    // Dashboard statistics views
    private lateinit var tvPendingCount: TextView
    private lateinit var tvApprovedCount: TextView
    private lateinit var tvCompletedCount: TextView
    private lateinit var tvTotalRevenue: TextView

    // Navigation buttons
    private lateinit var btnViewBookings: Button
    private lateinit var btnCreateBooking: Button

    // Map components
    private var map: GoogleMap? = null
    private var userLocation: Location? = null
    private var isMapReady = false

    /**
     * Initialize the activity
     */
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        repository = BookingRepository(this)

        initializeViews()
        setupButtons()
        loadDashboardStats()
        initializeMap()

        supportActionBar?.title = "EV Charging Hub"

        // Request location permission if needed
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) != PackageManager.PERMISSION_GRANTED) {
            ActivityCompat.requestPermissions(
                this,
                arrayOf(Manifest.permission.ACCESS_FINE_LOCATION),
                REQUEST_LOCATION_PERMISSION
            )
        } else {
            getUserLocation()
        }
    }

    /**
     * Initialize view components
     */
    private fun initializeViews() {
        tvPendingCount = findViewById(R.id.tvPendingCount)
        tvApprovedCount = findViewById(R.id.tvApprovedCount)
        tvCompletedCount = findViewById(R.id.tvCompletedCount)
        tvTotalRevenue = findViewById(R.id.tvTotalRevenue)

        btnViewBookings = findViewById(R.id.btnViewBookings)
        btnCreateBooking = findViewById(R.id.btnCreateBooking)
    }

    /**
     * Setup button click listeners
     */
    private fun setupButtons() {
        btnViewBookings.setOnClickListener {
            startActivity(Intent(this, BookingListActivity::class.java))
        }

        btnCreateBooking.setOnClickListener {
            val intent = Intent(this, BookingListActivity::class.java)
            startActivity(intent)
        }
    }

    /**
     * Initialize the map fragment
     */
    private fun initializeMap() {
        val mapFragment = supportFragmentManager
            .findFragmentById(R.id.mapFragment) as? SupportMapFragment
        mapFragment?.getMapAsync(this)
    }

    /**
     * Get user's current location
     */
    private fun getUserLocation() {
        val fusedClient = LocationServices.getFusedLocationProviderClient(this)
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fusedClient.lastLocation.addOnSuccessListener { loc: Location? ->
                loc?.let {
                    userLocation = it
                    if (isMapReady) {
                        loadStationsAndShowMarkers()
                    }
                }
            }.addOnFailureListener {
                // Continue without user location
                if (isMapReady) {
                    loadStationsAndShowMarkers()
                }
            }
        }
    }

    /**
     * Called when the map is ready
     */
    override fun onMapReady(googleMap: GoogleMap) {
        map = googleMap
        isMapReady = true

        // Configure map UI for better dashboard experience
        map?.uiSettings?.apply {
            isZoomControlsEnabled = true
            isMyLocationButtonEnabled = true
            isMapToolbarEnabled = false
            isCompassEnabled = true
        }

        // Enable my-location layer if permission granted
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            try {
                map?.isMyLocationEnabled = true
            } catch (e: SecurityException) {
                // Permission denied
            }
        }

        // Set up marker click listener with info window
        map?.setOnMarkerClickListener { marker ->
            marker.showInfoWindow()
            true
        }

        // Set info window click listener (optional - for future station details)
        map?.setOnInfoWindowClickListener { marker ->
            Toast.makeText(this, "Station: ${marker.title}", Toast.LENGTH_SHORT).show()
        }

        // Load stations and display markers
        loadStationsAndShowMarkers()
    }

    /**
     * Load stations and display them on the map
     */
    private fun loadStationsAndShowMarkers() {
        lifecycleScope.launch {
            val result = repository.getAllStations()
            result.onSuccess { stations ->
                if (stations.isEmpty()) {
                    Toast.makeText(this@MainActivity, "No charging stations available", Toast.LENGTH_SHORT).show()
                    return@onSuccess
                }

                // Filter stations by proximity when user location is available
                val nearbyStations = userLocation?.let { loc ->
                    stations.filter { station ->
                        val dist = FloatArray(1)
                        Location.distanceBetween(
                            loc.latitude,
                            loc.longitude,
                            station.latitude,
                            station.longitude,
                            dist
                        )
                        dist[0] <= NEARBY_RADIUS_METERS
                    }.sortedBy { station ->
                        // Sort by distance
                        val dist = FloatArray(1)
                        Location.distanceBetween(
                            loc.latitude,
                            loc.longitude,
                            station.latitude,
                            station.longitude,
                            dist
                        )
                        dist[0]
                    }
                } ?: stations.take(15) // Show first 15 if no location

                val toShow = if (nearbyStations.isEmpty()) {
                    // If no nearby stations, show first 15 from all stations
                    stations.take(15)
                } else {
                    nearbyStations
                }

                // Clear existing markers
                map?.clear()

                // Add markers for stations
                var firstLatLng: LatLng? = null
                toShow.forEach { station ->
                    addMarkerForStation(station)
                    if (firstLatLng == null) {
                        firstLatLng = LatLng(station.latitude, station.longitude)
                    }
                }

                // Center camera on user location or first station
                val cameraTarget = userLocation?.let {
                    LatLng(it.latitude, it.longitude)
                } ?: firstLatLng

                cameraTarget?.let {
                    map?.animateCamera(CameraUpdateFactory.newLatLngZoom(it, 12f))
                }

                // Show count of stations displayed
                val message = if (userLocation != null) {
                    "Showing ${toShow.size} nearby stations within 10km"
                } else {
                    "Showing ${toShow.size} stations"
                }
                Toast.makeText(this@MainActivity, message, Toast.LENGTH_SHORT).show()
            }.onFailure { error ->
                Toast.makeText(this@MainActivity, "Failed to load stations: ${error.message}", Toast.LENGTH_SHORT).show()
            }
        }
    }

    /**
     * Add a marker for a charging station with color-coded availability
     */
    private fun addMarkerForStation(station: Station) {
        try {
            val position = LatLng(station.latitude, station.longitude)

            // Determine marker color based on available slots
            val markerColor = when {
                station.availableSlots > 5 -> BitmapDescriptorFactory.HUE_GREEN    // Plenty available
                station.availableSlots in 3..5 -> BitmapDescriptorFactory.HUE_YELLOW // Moderate
                station.availableSlots in 1..2 -> BitmapDescriptorFactory.HUE_ORANGE // Low
                station.availableSlots > 0 -> BitmapDescriptorFactory.HUE_RED       // Very low
                else -> BitmapDescriptorFactory.HUE_VIOLET                          // None available
            }

            // Create snippet with distance if user location available
            val snippet = userLocation?.let { loc ->
                val dist = FloatArray(1)
                Location.distanceBetween(
                    loc.latitude,
                    loc.longitude,
                    station.latitude,
                    station.longitude,
                    dist
                )
                val distKm = dist[0] / 1000
                "Slots: ${station.availableSlots} • Rating: ${station.rating}⭐ • ${String.format("%.1f", distKm)}km away"
            } ?: "Slots: ${station.availableSlots} • Rating: ${station.rating}⭐"

            val marker = MarkerOptions()
                .position(position)
                .title(station.stationName)
                .snippet(snippet)
                .icon(BitmapDescriptorFactory.defaultMarker(markerColor))

            map?.addMarker(marker)
        } catch (e: Exception) {
            // Ignore malformed coordinates
        }
    }

    /**
     * Load dashboard statistics
     */
    private fun loadDashboardStats() {
        lifecycleScope.launch {
            val result = repository.getAllBookings()

            result.onSuccess { bookings ->
                val stats = DashboardStats(
                    pendingReservations = bookings.count { it.status == "Pending" },
                    approvedReservations = bookings.count { it.status == "Approved" },
                    completedReservations = bookings.count { it.status == "Completed" },
                    totalRevenue = bookings
                        .filter { it.status == "Completed" }
                        .sumOf { it.cost }
                )

                updateDashboard(stats)
            }.onFailure {
                // Show default values on error
                updateDashboard(DashboardStats())
            }
        }
    }

    /**
     * Update dashboard UI with statistics
     */
    private fun updateDashboard(stats: DashboardStats) {
        tvPendingCount.text = stats.pendingReservations.toString()
        tvApprovedCount.text = stats.approvedReservations.toString()
        tvCompletedCount.text = stats.completedReservations.toString()
        tvTotalRevenue.text = "Rs.${String.format("%.2f", stats.totalRevenue)}"
    }

    /**
     * Handle location permission result
     */
    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<out String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_LOCATION_PERMISSION) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                getUserLocation()
                map?.let {
                    if (ActivityCompat.checkSelfPermission(
                            this,
                            Manifest.permission.ACCESS_FINE_LOCATION
                        ) == PackageManager.PERMISSION_GRANTED
                    ) {
                        try {
                            it.isMyLocationEnabled = true
                            loadStationsAndShowMarkers()
                        } catch (e: SecurityException) {
                            // Permission denied
                        }
                    }
                }
            } else {
                // Permission denied - still show stations without location filtering
                Toast.makeText(this, "Location permission denied. Showing all stations.", Toast.LENGTH_SHORT).show()
                if (isMapReady) {
                    loadStationsAndShowMarkers()
                }
            }
        }
    }

    /**
     * Reload stats when returning to activity
     */
    override fun onResume() {
        super.onResume()
        loadDashboardStats()
    }
}