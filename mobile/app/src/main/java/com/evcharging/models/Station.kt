package com.evcharging.models

data class Station(
    val id: String,
    val name: String,
    val location: String,
    val availableSlots: Int
)