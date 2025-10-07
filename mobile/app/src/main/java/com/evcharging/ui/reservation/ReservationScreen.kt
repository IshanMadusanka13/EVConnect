package com.evcharging.ui.reservation

import androidx.compose.foundation.layout.*
import androidx.compose.material.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.evcharging.models.Station
import com.evcharging.services.BookingService
import com.evcharging.services.StationService
import com.evcharging.ui.theme.ColorTheme

@Composable
fun ReservationScreen(
    bookingService: BookingService,
    stationService: StationService,
    onReservationCreated: (String) -> Unit
) {
    var selectedStation by remember { mutableStateOf<Station?>(null) }
    var reservationDate by remember { mutableStateOf("") }
    var startTime by remember { mutableStateOf("") }
    var endTime by remember { mutableStateOf("") }
    var isLoading by remember { mutableStateOf(false) }
    var errorMessage by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(text = "Create a New Reservation", style = MaterialTheme.typography.h5)

        // Station selection and input fields
        // Add your UI components for selecting a station, date, and time here

        Button(
            onClick = {
                isLoading = true
                errorMessage = ""
                // Call bookingService to create a booking
                // Handle success and error cases
                isLoading = false
            },
            enabled = selectedStation != null && reservationDate.isNotEmpty() && startTime.isNotEmpty() && endTime.isNotEmpty()
        ) {
            if (isLoading) {
                CircularProgressIndicator(modifier = Modifier.size(24.dp))
            } else {
                Text(text = "Reserve")
            }
        }

        if (errorMessage.isNotEmpty()) {
            Text(text = errorMessage, color = ColorTheme.error)
        }
    }
}