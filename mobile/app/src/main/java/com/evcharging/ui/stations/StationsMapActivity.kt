package com.evcharging.ui.stations

import android.Manifest
import android.content.pm.PackageManager
import android.location.Location
import android.os.Bundle
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.lifecycle.lifecycleScope
import com.evcharging.R
import com.evcharging.models.Station
import com.evcharging.repository.BookingRepository
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.CameraUpdateFactory
import com.google.android.gms.maps.GoogleMap
import com.google.android.gms.maps.OnMapReadyCallback
import com.google.android.gms.maps.SupportMapFragment
import com.google.android.gms.maps.model.LatLng
import com.google.android.gms.maps.model.MarkerOptions
import kotlinx.coroutines.launch
import android.widget.Toast

private const val REQUEST_LOCATION_PERMISSION = 1001
private const val NEARBY_RADIUS_METERS = 10_000f // 10 km

/**
 * Activity that displays nearby charging stations on a Google Map.
 * Uses existing BookingRepository.getAllStations() to fetch station data.
 */
class StationsMapActivity : AppCompatActivity(), OnMapReadyCallback {

    private lateinit var map: GoogleMap
    private lateinit var repository: BookingRepository
    private var userLocation: Location? = null

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.stations_activity_map)

        supportActionBar?.apply {
            title = getString(R.string.title_nearby_stations)
            setDisplayHomeAsUpEnabled(true)
        }

        repository = BookingRepository(this)

        val mapFragment = supportFragmentManager
            .findFragmentById(R.id.mapFragment) as SupportMapFragment
        mapFragment.getMapAsync(this)

        // Initialize fused location provider
        val fusedClient = LocationServices.getFusedLocationProviderClient(this)
        // Try to get the last known location if permission is granted
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            fusedClient.lastLocation.addOnSuccessListener { loc: Location? ->
                loc?.let { userLocation = it }
            }
        } else {
            // Request permission; on result we'll attempt to load stations centered around user
            ActivityCompat.requestPermissions(this, arrayOf(Manifest.permission.ACCESS_FINE_LOCATION), REQUEST_LOCATION_PERMISSION)
        }
    }

    override fun onMapReady(googleMap: GoogleMap) {
        map = googleMap

        // Enable basic UI controls
        map.uiSettings.isZoomControlsEnabled = true

        // If location permission granted, enable my-location layer
        if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
            try {
                map.isMyLocationEnabled = true
            } catch (e: SecurityException) {
                // ignore
            }
        }

        // Load stations and add markers; filter by user location when available
        loadStationsAndShowMarkers()
    }

    private fun loadStationsAndShowMarkers() {
        lifecycleScope.launch {
            val result = repository.getAllStations()
            result
                .onSuccess { stations ->
                    if (stations.isEmpty()) {
                        Toast.makeText(this@StationsMapActivity, "No stations available", Toast.LENGTH_LONG).show()
                        return@onSuccess
                    }

                    // Filter stations by proximity to user's location when available
                    val nearbyStations = userLocation?.let { loc ->
                        stations.filter { station ->
                            val dist = FloatArray(1)
                            android.location.Location.distanceBetween(
                                loc.latitude,
                                loc.longitude,
                                station.latitude,
                                station.longitude,
                                dist
                            )
                            dist[0] <= NEARBY_RADIUS_METERS
                        }
                    } ?: stations // fallback to all stations when no user location

                    val toShow = if (nearbyStations.isEmpty()) stations else nearbyStations

                    var firstLatLng: LatLng? = null
                    toShow.forEach { station ->
                        addMarkerForStation(station)
                        if (firstLatLng == null) {
                            firstLatLng = LatLng(station.latitude, station.longitude)
                        }
                    }

                    // Move camera to first shown station
                    firstLatLng?.let {
                        map.moveCamera(CameraUpdateFactory.newLatLngZoom(it, 13f))
                    }
                }
                .onFailure { err ->
                    Toast.makeText(this@StationsMapActivity, "Failed to load stations: ${err.message}", Toast.LENGTH_LONG).show()
                }
        }
    }

    private fun addMarkerForStation(station: Station) {
        try {
            val position = LatLng(station.latitude, station.longitude)
            val marker = MarkerOptions()
                .position(position)
                .title(station.stationName)
                .snippet("${station.address}\nSlots: ${station.availableSlots} • Rating: ${station.rating}")

            map.addMarker(marker)
        } catch (e: Exception) {
            // ignore malformed coordinates
        }
    }

    override fun onRequestPermissionsResult(requestCode: Int, permissions: Array<out String>, grantResults: IntArray) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_LOCATION_PERMISSION) {
            if (grantResults.isNotEmpty() && grantResults[0] == PackageManager.PERMISSION_GRANTED) {
                // Permission granted, try to get the last location
                val fusedClient = LocationServices.getFusedLocationProviderClient(this)
                if (ActivityCompat.checkSelfPermission(this, Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                    fusedClient.lastLocation.addOnSuccessListener { loc: Location? ->
                        loc?.let {
                            userLocation = it
                            // reload markers to prefer nearby ones
                            map.clear()
                            loadStationsAndShowMarkers()
                        }
                    }
                }
            } else {
                // Permission denied; we continue showing all stations
                Toast.makeText(this, "Location permission denied — showing all stations", Toast.LENGTH_SHORT).show()
            }
        }
    }

    override fun onSupportNavigateUp(): Boolean {
        onBackPressed()
        return true
    }
}
