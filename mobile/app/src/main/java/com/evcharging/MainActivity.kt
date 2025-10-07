package com.evcharging

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.material.MaterialTheme
import androidx.compose.material.Surface
import androidx.compose.runtime.Composable
import com.evcharging.ui.theme.ColorTheme
import com.evcharging.ui.reservation.ReservationScreen
import com.evcharging.ui.bookings.BookingsScreen

class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContent {
            MyApp {
                // You can switch between screens here
                ReservationScreen() // or BookingsScreen()
            }
        }
    }
}

@Composable
fun MyApp(content: @Composable () -> Unit) {
    MaterialTheme(colors = ColorTheme) {
        Surface {
            content()
        }
    }
}