package com.evcharging.ui.bookings

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.evcharging.models.Booking
import com.evcharging.services.BookingService

@Composable
fun BookingsScreen(
    bookingService: BookingService = viewModel()
) {
    var bookings by remember { mutableStateOf<List<Booking>>(emptyList()) }
    var loading by remember { mutableStateOf(true) }

    LaunchedEffect(Unit) {
        bookings = bookingService.getAllBookings()
        loading = false
    }

    if (loading) {
        CircularProgressIndicator(modifier = Modifier.padding(16.dp))
    } else {
        Scaffold(
            topBar = {
                TopAppBar(title = { Text("My Bookings") })
            }
        ) { paddingValues ->
            Column(modifier = Modifier.padding(paddingValues).padding(16.dp)) {
                if (bookings.isEmpty()) {
                    Text("No bookings found.")
                } else {
                    bookings.forEach { booking ->
                        BookingItem(booking)
                    }
                }
            }
        }
    }
}

@Composable
fun BookingItem(booking: Booking) {
    Card(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        elevation = 4.dp
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Text("Station ID: ${booking.stationId}")
            Text("Reservation Date: ${booking.reservationDate}")
            Text("Start Time: ${booking.startTime}")
            Text("End Time: ${booking.endTime}")
            Text("Status: ${booking.status}")
        }
    }
}