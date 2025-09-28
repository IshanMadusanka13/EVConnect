# EV Charging Station Booking System

## Overview
An end-to-end EV Charging Station Booking System built using client-server architecture. The system provides a web application for back-office operations and a mobile application for EV owners, all connected to a centralized web service.

## Team Members
- **IT22540744** - Madusanka A.M.A.I.
- **IT22630384** - Fonseka H.F.H.O.
- **IT22077110** - Kapugedara A.K.T.R.
- **IT22086402** - Fernando M.H.S.J.

## System Architecture
- **Web Application**: React.js/Bootstrap 5 interface for back-office and station operators
- **Mobile Application**: Pure Android application with SQLite database
- **Web Service**: C# Web API hosted on Windows IIS Server with MongoDB (NoSQL)

## Features

### Web Application
- User management (Backoffice and Station Operator roles)
- EV owner profile management (NIC as primary key)
- Charging station and slot management
- Booking management with time constraints
- Responsive UI with Bootstrap 5

### Mobile Application
- EV owner account registration and management
- Reservation management (create, modify, cancel)
- QR code generation for approved bookings
- Booking history and dashboard
- Google Maps integration for nearby stations
- Station operator QR code scanning

### Web Service
- Centralized business logic implementation
- RESTful API endpoints
- MongoDB data persistence
- Automatic slot assignment based on availability
- Real-time booking validation

---
*SE4040 - Enterprise Application Development | SLIIT | 2025*