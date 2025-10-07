# EV Charging Reservation App

## Overview
The EV Charging Reservation App is a mobile application designed to manage electric vehicle charging reservations. Users can view available charging stations, create reservations, and manage their bookings seamlessly.

## Features
- **User Management**: Users can register and manage their profiles.
- **Station Management**: View available charging stations and their details.
- **Reservation Management**: Create, update, and cancel reservations for charging sessions.
- **Booking Overview**: View a list of upcoming and past bookings.
- **QR Code Generation**: Generate QR codes for reservations for easy access.

## Project Structure
```
ev-charging-reservation-app
├── app
│   ├── src
│   │   ├── main
│   │   │   ├── java
│   │   │   │   └── com
│   │   │   │       └── evcharging
│   │   │   │           ├── models
│   │   │   │           │   ├── Booking.kt
│   │   │   │           │   ├── Station.kt
│   │   │   │           │   └── User.kt
│   │   │   │           ├── api
│   │   │   │           │   └── ApiService.kt
│   │   │   │           ├── services
│   │   │   │           │   ├── BookingService.kt
│   │   │   │           │   └── StationService.kt
│   │   │   │           ├── ui
│   │   │   │           │   ├── theme
│   │   │   │           │   │   └── ColorTheme.kt
│   │   │   │           │   ├── reservation
│   │   │   │           │   │   └── ReservationScreen.kt
│   │   │   │           │   └── bookings
│   │   │   │           │       └── BookingsScreen.kt
│   │   │   │           └── MainActivity.kt
│   │   │   └── res
│   │   │       ├── layout
│   │   │       │   ├── activity_main.xml
│   │   │       │   ├── reservation_screen.xml
│   │   │       │   └── bookings_screen.xml
│   │   │       └── values
│   │   │           ├── colors.xml
│   │   │           └── themes.xml
│   └── test
│       └── java
│           └── com
│               └── evcharging
│                   └── ExampleUnitTest.kt
├── build.gradle
└── README.md
```

## Setup Instructions
1. **Clone the Repository**: 
   ```
   git clone <repository-url>
   cd ev-charging-reservation-app
   ```

2. **Open the Project**: Open the project in your preferred IDE (e.g., Android Studio).

3. **Build the Project**: Ensure all dependencies are resolved and the project builds successfully.

4. **Run the Application**: Connect an Android device or start an emulator, then run the application.

## Color Theme
The application maintains a consistent color theme that mirrors the web application, ensuring a cohesive user experience across platforms.

## Contributing
Contributions are welcome! Please submit a pull request or open an issue for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.