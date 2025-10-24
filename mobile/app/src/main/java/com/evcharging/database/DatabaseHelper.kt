package com.evcharging.database

import android.content.ContentValues
import android.content.Context
import android.database.sqlite.SQLiteDatabase
import android.database.sqlite.SQLiteOpenHelper
import com.evcharging.models.EVOwner
import com.evcharging.models.LocalBooking

/**
 * SQLite database helper class
 * Handles database creation, upgrades, and CRUD operations
 */
class DatabaseHelper(context: Context) : SQLiteOpenHelper(context, DATABASE_NAME, null, DATABASE_VERSION) {

    companion object {
        private const val DATABASE_NAME = "ev_charging.db"
        private const val DATABASE_VERSION = 10  // Incremented version for schema change

        // Table names
        const val TABLE_BOOKINGS = "bookings"
        const val TABLE_STATIONS = "stations"
        const val TABLE_EV_OWNERS = "ev_owners"

        // Bookings table columns
        const val COLUMN_ID = "id"
        const val COLUMN_STATION_ID = "station_id"
        const val COLUMN_NIC = "nic"
        const val COLUMN_SLOT_ID = "slot_id"
        const val COLUMN_RESERVATION_DATE = "reservation_date"
        const val COLUMN_START_TIME = "start_time"
        const val COLUMN_END_TIME = "end_time"
        const val COLUMN_STATUS = "status"
        const val COLUMN_CHARGER_TYPE = "charger_type"
        const val COLUMN_COST = "cost"
        const val COLUMN_ENERGY_CONSUMED = "energy_consumed"
        const val COLUMN_QR_CODE_DATA = "qr_code_data"
        const val COLUMN_SYNCED = "synced_with_server"
        const val COLUMN_LAST_MODIFIED = "last_modified"

        // Stations table columns
        const val COLUMN_STATION_NAME = "station_name"
        const val COLUMN_ADDRESS = "address"
        const val COLUMN_LATITUDE = "latitude"
        const val COLUMN_LONGITUDE = "longitude"
        const val COLUMN_IS_ACTIVE = "is_active"
        const val COLUMN_RATING = "rating"

        // EV Owners table columns - UPDATED (renamed conflicting declarations)
        const val COLUMN_FIRST_NAME = "first_name"
        const val COLUMN_LAST_NAME = "last_name"
        const val COLUMN_DATE_OF_BIRTH = "date_of_birth"
        const val COLUMN_GENDER = "gender"
        const val COLUMN_EMAIL = "email"
        const val COLUMN_PHONE = "phone_number"
        const val COLUMN_OWNER_ADDRESS = "owner_address" // Renamed from COLUMN_ADDRESS
        const val COLUMN_PASSWORD = "password"
        const val COLUMN_VEHICLE_TYPE = "vehicle_type"
        const val COLUMN_VEHICLE_MODEL = "vehicle_model"
        const val COLUMN_VEHICLE_PLATE = "vehicle_plate_number"
        const val COLUMN_BATTERY_CAPACITY = "battery_capacity"
        const val COLUMN_COMPATIBLE_CHARGERS = "compatible_charger_types"
        const val COLUMN_OWNER_IS_ACTIVE = "owner_is_active" // Renamed from COLUMN_IS_ACTIVE
    }

    /**
     * Called when database is created for the first time
     * Creates all necessary tables
     */
    override fun onCreate(db: SQLiteDatabase?) {
        // Create bookings table
        val createBookingsTable = """
            CREATE TABLE $TABLE_BOOKINGS (
                $COLUMN_ID TEXT PRIMARY KEY,
                $COLUMN_STATION_ID TEXT NOT NULL,
                $COLUMN_NIC TEXT NOT NULL,
                $COLUMN_SLOT_ID TEXT NOT NULL,
                $COLUMN_RESERVATION_DATE TEXT NOT NULL,
                $COLUMN_START_TIME TEXT NOT NULL,
                $COLUMN_END_TIME TEXT NOT NULL,
                $COLUMN_STATUS TEXT NOT NULL,
                $COLUMN_CHARGER_TYPE TEXT NOT NULL,
                $COLUMN_COST REAL DEFAULT 0,
                $COLUMN_ENERGY_CONSUMED REAL DEFAULT 0,
                $COLUMN_QR_CODE_DATA TEXT,
                $COLUMN_SYNCED INTEGER DEFAULT 0,
                $COLUMN_LAST_MODIFIED INTEGER DEFAULT 0
            )
        """.trimIndent()

        // Create stations table
        val createStationsTable = """
            CREATE TABLE $TABLE_STATIONS (
                $COLUMN_ID TEXT PRIMARY KEY,
                $COLUMN_STATION_NAME TEXT NOT NULL,
                $COLUMN_ADDRESS TEXT NOT NULL,
                $COLUMN_LATITUDE REAL DEFAULT 0,
                $COLUMN_LONGITUDE REAL DEFAULT 0,
                $COLUMN_IS_ACTIVE INTEGER DEFAULT 1,
                $COLUMN_RATING REAL DEFAULT 0
            )
        """.trimIndent()

        // Create EV owners table - UPDATED SCHEMA
        val createEVOwnersTable = """
            CREATE TABLE $TABLE_EV_OWNERS (
                $COLUMN_NIC TEXT PRIMARY KEY,
                $COLUMN_FIRST_NAME TEXT NOT NULL,
                $COLUMN_LAST_NAME TEXT NOT NULL,
                $COLUMN_DATE_OF_BIRTH TEXT NOT NULL,
                $COLUMN_GENDER TEXT NOT NULL,
                $COLUMN_EMAIL TEXT NOT NULL,
                $COLUMN_PHONE TEXT NOT NULL,
                $COLUMN_OWNER_ADDRESS TEXT NOT NULL,
                $COLUMN_PASSWORD TEXT NOT NULL,
                $COLUMN_VEHICLE_TYPE TEXT NOT NULL,
                $COLUMN_VEHICLE_MODEL TEXT NOT NULL,
                $COLUMN_VEHICLE_PLATE TEXT NOT NULL,
                $COLUMN_BATTERY_CAPACITY TEXT NOT NULL,
                $COLUMN_COMPATIBLE_CHARGERS TEXT NOT NULL,
                $COLUMN_OWNER_IS_ACTIVE INTEGER DEFAULT 1
            )
        """.trimIndent()

        db?.execSQL(createBookingsTable)
        db?.execSQL(createStationsTable)
        db?.execSQL(createEVOwnersTable)
    }

    /**
     * Called when database needs to be upgraded
     * Handles migration from old schema to new schema
     */
    override fun onUpgrade(db: SQLiteDatabase?, oldVersion: Int, newVersion: Int) {
        // Log the upgrade for debugging
        android.util.Log.d("DatabaseHelper", "Upgrading database from version $oldVersion to $newVersion")

        // Drop ALL tables and recreate them
        db?.execSQL("DROP TABLE IF EXISTS $TABLE_EV_OWNERS")
        db?.execSQL("DROP TABLE IF EXISTS $TABLE_BOOKINGS")
        db?.execSQL("DROP TABLE IF EXISTS $TABLE_STATIONS")

        // Recreate all tables with current schema
        onCreate(db)
    }

    // Add this method to handle downgrades too
    override fun onDowngrade(db: SQLiteDatabase?, oldVersion: Int, newVersion: Int) {
        // For development, recreate all tables on downgrade
        db?.execSQL("DROP TABLE IF EXISTS $TABLE_EV_OWNERS")
        db?.execSQL("DROP TABLE IF EXISTS $TABLE_BOOKINGS")
        db?.execSQL("DROP TABLE IF EXISTS $TABLE_STATIONS")

        // Recreate all tables
        onCreate(db)
    }

    // ============ BOOKING OPERATIONS ============

    /**
     * Insert a new booking into local database
     * @param booking LocalBooking object to insert
     * @return Row ID of inserted booking, or -1 if error
     */
    fun insertBooking(booking: LocalBooking): Long {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_ID, booking.id)
            put(COLUMN_STATION_ID, booking.stationId)
            put(COLUMN_NIC, booking.nic)
            put(COLUMN_SLOT_ID, booking.slotId)
            put(COLUMN_RESERVATION_DATE, booking.reservationDate)
            put(COLUMN_START_TIME, booking.startTime)
            put(COLUMN_END_TIME, booking.endTime)
            put(COLUMN_STATUS, booking.status)
            put(COLUMN_CHARGER_TYPE, booking.chargerType)
            put(COLUMN_COST, booking.cost)
            put(COLUMN_ENERGY_CONSUMED, booking.energyConsumed)
            put(COLUMN_QR_CODE_DATA, booking.qrCodeData)
            put(COLUMN_SYNCED, if (booking.syncedWithServer) 1 else 0)
            put(COLUMN_LAST_MODIFIED, booking.lastModified)
        }
        return db.insertWithOnConflict(TABLE_BOOKINGS, null, values, SQLiteDatabase.CONFLICT_REPLACE)
    }

    /**
     * Get all bookings from local database
     * @return List of LocalBooking objects
     */
    fun getAllBookings(): List<LocalBooking> {
        val bookings = mutableListOf<LocalBooking>()
        val db = readableDatabase
        val cursor = db.query(
            TABLE_BOOKINGS,
            null,
            null,
            null,
            null,
            null,
            "$COLUMN_LAST_MODIFIED DESC"
        )

        with(cursor) {
            while (moveToNext()) {
                val booking = LocalBooking(
                    id = getString(getColumnIndexOrThrow(COLUMN_ID)),
                    stationId = getString(getColumnIndexOrThrow(COLUMN_STATION_ID)),
                    nic = getString(getColumnIndexOrThrow(COLUMN_NIC)),
                    slotId = getString(getColumnIndexOrThrow(COLUMN_SLOT_ID)),
                    reservationDate = getString(getColumnIndexOrThrow(COLUMN_RESERVATION_DATE)),
                    startTime = getString(getColumnIndexOrThrow(COLUMN_START_TIME)),
                    endTime = getString(getColumnIndexOrThrow(COLUMN_END_TIME)),
                    status = getString(getColumnIndexOrThrow(COLUMN_STATUS)),
                    chargerType = getString(getColumnIndexOrThrow(COLUMN_CHARGER_TYPE)),
                    cost = getDouble(getColumnIndexOrThrow(COLUMN_COST)),
                    energyConsumed = getDouble(getColumnIndexOrThrow(COLUMN_ENERGY_CONSUMED)),
                    qrCodeData = getString(getColumnIndexOrThrow(COLUMN_QR_CODE_DATA)),
                    syncedWithServer = getInt(getColumnIndexOrThrow(COLUMN_SYNCED)) == 1,
                    lastModified = getLong(getColumnIndexOrThrow(COLUMN_LAST_MODIFIED))
                )
                bookings.add(booking)
            }
        }
        cursor.close()
        return bookings
    }

    /**
     * Get bookings by status
     * @param status Booking status to filter by
     * @return List of LocalBooking objects matching status
     */
    fun getBookingsByStatus(status: String): List<LocalBooking> {
        val bookings = mutableListOf<LocalBooking>()
        val db = readableDatabase
        val cursor = db.query(
            TABLE_BOOKINGS,
            null,
            "$COLUMN_STATUS = ?",
            arrayOf(status),
            null,
            null,
            "$COLUMN_LAST_MODIFIED DESC"
        )

        with(cursor) {
            while (moveToNext()) {
                val booking = LocalBooking(
                    id = getString(getColumnIndexOrThrow(COLUMN_ID)),
                    stationId = getString(getColumnIndexOrThrow(COLUMN_STATION_ID)),
                    nic = getString(getColumnIndexOrThrow(COLUMN_NIC)),
                    slotId = getString(getColumnIndexOrThrow(COLUMN_SLOT_ID)),
                    reservationDate = getString(getColumnIndexOrThrow(COLUMN_RESERVATION_DATE)),
                    startTime = getString(getColumnIndexOrThrow(COLUMN_START_TIME)),
                    endTime = getString(getColumnIndexOrThrow(COLUMN_END_TIME)),
                    status = getString(getColumnIndexOrThrow(COLUMN_STATUS)),
                    chargerType = getString(getColumnIndexOrThrow(COLUMN_CHARGER_TYPE)),
                    cost = getDouble(getColumnIndexOrThrow(COLUMN_COST)),
                    energyConsumed = getDouble(getColumnIndexOrThrow(COLUMN_ENERGY_CONSUMED)),
                    qrCodeData = getString(getColumnIndexOrThrow(COLUMN_QR_CODE_DATA)),
                    syncedWithServer = getInt(getColumnIndexOrThrow(COLUMN_SYNCED)) == 1,
                    lastModified = getLong(getColumnIndexOrThrow(COLUMN_LAST_MODIFIED))
                )
                bookings.add(booking)
            }
        }
        cursor.close()
        return bookings
    }

    /**
     * Update booking in local database
     * @param booking LocalBooking object with updated data
     * @return Number of rows affected
     */
    fun updateBooking(booking: LocalBooking): Int {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_STATION_ID, booking.stationId)
            put(COLUMN_NIC, booking.nic)
            put(COLUMN_SLOT_ID, booking.slotId)
            put(COLUMN_RESERVATION_DATE, booking.reservationDate)
            put(COLUMN_START_TIME, booking.startTime)
            put(COLUMN_END_TIME, booking.endTime)
            put(COLUMN_STATUS, booking.status)
            put(COLUMN_CHARGER_TYPE, booking.chargerType)
            put(COLUMN_COST, booking.cost)
            put(COLUMN_ENERGY_CONSUMED, booking.energyConsumed)
            put(COLUMN_QR_CODE_DATA, booking.qrCodeData)
            put(COLUMN_SYNCED, if (booking.syncedWithServer) 1 else 0)
            put(COLUMN_LAST_MODIFIED, booking.lastModified)
        }
        return db.update(TABLE_BOOKINGS, values, "$COLUMN_ID = ?", arrayOf(booking.id))
    }

    /**
     * Delete booking from local database
     * @param bookingId ID of booking to delete
     * @return Number of rows affected
     */
    fun deleteBooking(bookingId: String): Int {
        val db = writableDatabase
        return db.delete(TABLE_BOOKINGS, "$COLUMN_ID = ?", arrayOf(bookingId))
    }

    /**
     * Get unsynced bookings (for offline sync)
     * @return List of LocalBooking objects that need to be synced
     */
    fun getUnsyncedBookings(): List<LocalBooking> {
        val bookings = mutableListOf<LocalBooking>()
        val db = readableDatabase
        val cursor = db.query(
            TABLE_BOOKINGS,
            null,
            "$COLUMN_SYNCED = 0",
            null,
            null,
            null,
            "$COLUMN_LAST_MODIFIED ASC"
        )

        with(cursor) {
            while (moveToNext()) {
                val booking = LocalBooking(
                    id = getString(getColumnIndexOrThrow(COLUMN_ID)),
                    stationId = getString(getColumnIndexOrThrow(COLUMN_STATION_ID)),
                    nic = getString(getColumnIndexOrThrow(COLUMN_NIC)),
                    slotId = getString(getColumnIndexOrThrow(COLUMN_SLOT_ID)),
                    reservationDate = getString(getColumnIndexOrThrow(COLUMN_RESERVATION_DATE)),
                    startTime = getString(getColumnIndexOrThrow(COLUMN_START_TIME)),
                    endTime = getString(getColumnIndexOrThrow(COLUMN_END_TIME)),
                    status = getString(getColumnIndexOrThrow(COLUMN_STATUS)),
                    chargerType = getString(getColumnIndexOrThrow(COLUMN_CHARGER_TYPE)),
                    cost = getDouble(getColumnIndexOrThrow(COLUMN_COST)),
                    energyConsumed = getDouble(getColumnIndexOrThrow(COLUMN_ENERGY_CONSUMED)),
                    qrCodeData = getString(getColumnIndexOrThrow(COLUMN_QR_CODE_DATA)),
                    syncedWithServer = false,
                    lastModified = getLong(getColumnIndexOrThrow(COLUMN_LAST_MODIFIED))
                )
                bookings.add(booking)
            }
        }
        cursor.close()
        return bookings
    }

    /**
     * Mark booking as synced with server
     * @param bookingId ID of booking to mark as synced
     */
    fun markBookingAsSynced(bookingId: String) {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_SYNCED, 1)
        }
        db.update(TABLE_BOOKINGS, values, "$COLUMN_ID = ?", arrayOf(bookingId))
    }

    /**
     * Clear all bookings from local database
     */
    fun clearAllBookings() {
        val db = writableDatabase
        db.delete(TABLE_BOOKINGS, null, null)
    }

    // ============ EV OWNER OPERATIONS ============

    /**
     * Insert a new EV owner into local database
     * @param owner EVOwner object to insert
     * @return Row ID of inserted owner, or -1 if error
     */
    fun insertEVOwner(owner: EVOwner): Long {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_NIC, owner.nic)
            put(COLUMN_FIRST_NAME, owner.firstName)
            put(COLUMN_LAST_NAME, owner.lastName)
            put(COLUMN_DATE_OF_BIRTH, owner.dateOfBirth)
            put(COLUMN_GENDER, owner.gender)
            put(COLUMN_EMAIL, owner.email)
            put(COLUMN_PHONE, owner.phoneNumber)
            put(COLUMN_OWNER_ADDRESS, owner.address)
            put(COLUMN_PASSWORD, owner.password)
            put(COLUMN_VEHICLE_TYPE, owner.vehicleType)
            put(COLUMN_VEHICLE_MODEL, owner.vehicleModel)
            put(COLUMN_VEHICLE_PLATE, owner.vehiclePlateNumber)
            put(COLUMN_BATTERY_CAPACITY, owner.batteryCapacity)
            put(COLUMN_COMPATIBLE_CHARGERS, owner.compatibleChargerTypes)
            put(COLUMN_OWNER_IS_ACTIVE, if (owner.isActive) 1 else 0)
        }
        return db.insertWithOnConflict(TABLE_EV_OWNERS, null, values, SQLiteDatabase.CONFLICT_REPLACE)
    }

    /**
     * Get EV owner by NIC
     * @param nic National ID Card number
     * @return EVOwner object or null if not found
     */
    fun getEVOwnerByNIC(nic: String): EVOwner? {
        val db = readableDatabase
        val cursor = db.query(
            TABLE_EV_OWNERS,
            null,
            "$COLUMN_NIC = ?",
            arrayOf(nic),
            null,
            null,
            null
        )

        return with(cursor) {
            if (moveToFirst()) {
                EVOwner(
                    nic = getString(getColumnIndexOrThrow(COLUMN_NIC)),
                    firstName = getString(getColumnIndexOrThrow(COLUMN_FIRST_NAME)),
                    lastName = getString(getColumnIndexOrThrow(COLUMN_LAST_NAME)),
                    dateOfBirth = getString(getColumnIndexOrThrow(COLUMN_DATE_OF_BIRTH)),
                    gender = getString(getColumnIndexOrThrow(COLUMN_GENDER)),
                    email = getString(getColumnIndexOrThrow(COLUMN_EMAIL)),
                    phoneNumber = getString(getColumnIndexOrThrow(COLUMN_PHONE)),
                    address = getString(getColumnIndexOrThrow(COLUMN_OWNER_ADDRESS)),
                    password = getString(getColumnIndexOrThrow(COLUMN_PASSWORD)),
                    vehicleType = getString(getColumnIndexOrThrow(COLUMN_VEHICLE_TYPE)),
                    vehicleModel = getString(getColumnIndexOrThrow(COLUMN_VEHICLE_MODEL)),
                    vehiclePlateNumber = getString(getColumnIndexOrThrow(COLUMN_VEHICLE_PLATE)),
                    batteryCapacity = getString(getColumnIndexOrThrow(COLUMN_BATTERY_CAPACITY)),
                    compatibleChargerTypes = getString(getColumnIndexOrThrow(COLUMN_COMPATIBLE_CHARGERS)),
                    isActive = getInt(getColumnIndexOrThrow(COLUMN_OWNER_IS_ACTIVE)) == 1
                )
            } else {
                null
            }.also { cursor.close() }
        }
    }

    /**
     * Get all EV owners from local database
     * @return List of EVOwner objects
     */
    fun getAllEVOwners(): List<EVOwner> {
        val owners = mutableListOf<EVOwner>()
        val db = readableDatabase
        val cursor = db.query(
            TABLE_EV_OWNERS,
            null,
            null,
            null,
            null,
            null,
            "$COLUMN_FIRST_NAME ASC"
        )

        with(cursor) {
            while (moveToNext()) {
                val owner = EVOwner(
                    nic = getString(getColumnIndexOrThrow(COLUMN_NIC)),
                    firstName = getString(getColumnIndexOrThrow(COLUMN_FIRST_NAME)),
                    lastName = getString(getColumnIndexOrThrow(COLUMN_LAST_NAME)),
                    dateOfBirth = getString(getColumnIndexOrThrow(COLUMN_DATE_OF_BIRTH)),
                    gender = getString(getColumnIndexOrThrow(COLUMN_GENDER)),
                    email = getString(getColumnIndexOrThrow(COLUMN_EMAIL)),
                    phoneNumber = getString(getColumnIndexOrThrow(COLUMN_PHONE)),
                    address = getString(getColumnIndexOrThrow(COLUMN_OWNER_ADDRESS)),
                    password = getString(getColumnIndexOrThrow(COLUMN_PASSWORD)),
                    vehicleType = getString(getColumnIndexOrThrow(COLUMN_VEHICLE_TYPE)),
                    vehicleModel = getString(getColumnIndexOrThrow(COLUMN_VEHICLE_MODEL)),
                    vehiclePlateNumber = getString(getColumnIndexOrThrow(COLUMN_VEHICLE_PLATE)),
                    batteryCapacity = getString(getColumnIndexOrThrow(COLUMN_BATTERY_CAPACITY)),
                    compatibleChargerTypes = getString(getColumnIndexOrThrow(COLUMN_COMPATIBLE_CHARGERS)),
                    isActive = getInt(getColumnIndexOrThrow(COLUMN_OWNER_IS_ACTIVE)) == 1
                )
                owners.add(owner)
            }
        }
        cursor.close()
        return owners
    }

    /**
     * Update EV owner in local database
     * @param owner EVOwner object with updated data
     * @return Number of rows affected
     */
    fun updateEVOwner(owner: EVOwner): Int {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_FIRST_NAME, owner.firstName)
            put(COLUMN_LAST_NAME, owner.lastName)
            put(COLUMN_DATE_OF_BIRTH, owner.dateOfBirth)
            put(COLUMN_GENDER, owner.gender)
            put(COLUMN_EMAIL, owner.email)
            put(COLUMN_PHONE, owner.phoneNumber)
            put(COLUMN_OWNER_ADDRESS, owner.address)
            put(COLUMN_PASSWORD, owner.password)
            put(COLUMN_VEHICLE_TYPE, owner.vehicleType)
            put(COLUMN_VEHICLE_MODEL, owner.vehicleModel)
            put(COLUMN_VEHICLE_PLATE, owner.vehiclePlateNumber)
            put(COLUMN_BATTERY_CAPACITY, owner.batteryCapacity)
            put(COLUMN_COMPATIBLE_CHARGERS, owner.compatibleChargerTypes)
            put(COLUMN_OWNER_IS_ACTIVE, if (owner.isActive) 1 else 0)
        }
        return db.update(TABLE_EV_OWNERS, values, "$COLUMN_NIC = ?", arrayOf(owner.nic))
    }

    /**
     * Delete EV owner from local database
     * @param nic NIC of owner to delete
     * @return Number of rows affected
     */
    fun deleteEVOwner(nic: String): Int {
        val db = writableDatabase
        return db.delete(TABLE_EV_OWNERS, "$COLUMN_NIC = ?", arrayOf(nic))
    }

    /**
     * Check if EV owner exists by NIC
     * @param nic National ID Card number
     * @return true if owner exists, false otherwise
     */
    fun doesEVOwnerExist(nic: String): Boolean {
        val db = readableDatabase
        val cursor = db.query(
            TABLE_EV_OWNERS,
            arrayOf(COLUMN_NIC),
            "$COLUMN_NIC = ?",
            arrayOf(nic),
            null,
            null,
            null
        )
        val exists = cursor.count > 0
        cursor.close()
        return exists
    }

    /**
     * Authenticate EV owner by NIC and password
     * @param nic National ID Card number
     * @param password Password to verify
     * @return EVOwner object if authenticated, null otherwise
     */
    fun authenticateEVOwner(nic: String, password: String): EVOwner? {
        val db = readableDatabase
        val cursor = db.query(
            TABLE_EV_OWNERS,
            null,
            "$COLUMN_NIC = ? AND $COLUMN_PASSWORD = ? AND $COLUMN_OWNER_IS_ACTIVE = 1",
            arrayOf(nic, password),
            null,
            null,
            null
        )

        return with(cursor) {
            if (moveToFirst()) {
                EVOwner(
                    nic = getString(getColumnIndexOrThrow(COLUMN_NIC)),
                    firstName = getString(getColumnIndexOrThrow(COLUMN_FIRST_NAME)),
                    lastName = getString(getColumnIndexOrThrow(COLUMN_LAST_NAME)),
                    dateOfBirth = getString(getColumnIndexOrThrow(COLUMN_DATE_OF_BIRTH)),
                    gender = getString(getColumnIndexOrThrow(COLUMN_GENDER)),
                    email = getString(getColumnIndexOrThrow(COLUMN_EMAIL)),
                    phoneNumber = getString(getColumnIndexOrThrow(COLUMN_PHONE)),
                    address = getString(getColumnIndexOrThrow(COLUMN_OWNER_ADDRESS)),
                    password = getString(getColumnIndexOrThrow(COLUMN_PASSWORD)),
                    vehicleType = getString(getColumnIndexOrThrow(COLUMN_VEHICLE_TYPE)),
                    vehicleModel = getString(getColumnIndexOrThrow(COLUMN_VEHICLE_MODEL)),
                    vehiclePlateNumber = getString(getColumnIndexOrThrow(COLUMN_VEHICLE_PLATE)),
                    batteryCapacity = getString(getColumnIndexOrThrow(COLUMN_BATTERY_CAPACITY)),
                    compatibleChargerTypes = getString(getColumnIndexOrThrow(COLUMN_COMPATIBLE_CHARGERS)),
                    isActive = getInt(getColumnIndexOrThrow(COLUMN_OWNER_IS_ACTIVE)) == 1
                )
            } else {
                null
            }.also { cursor.close() }
        }
    }

    /**
     * Deactivate EV owner (set is_active to 0)
     * @param nic NIC of owner to deactivate
     * @return Number of rows affected
     */
    fun deactivateEVOwner(nic: String): Int {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_OWNER_IS_ACTIVE, 0)
        }
        return db.update(TABLE_EV_OWNERS, values, "$COLUMN_NIC = ?", arrayOf(nic))
    }

    /**
     * Toggle EV owner activation status
     * @param nic NIC of owner to toggle
     * @param isActive New activation status
     * @return Number of rows affected
     */
    fun toggleEVOwnerStatus(nic: String, isActive: Boolean): Int {
        val db = writableDatabase
        val values = ContentValues().apply {
            put(COLUMN_OWNER_IS_ACTIVE, if (isActive) 1 else 0)
        }
        return db.update(TABLE_EV_OWNERS, values, "$COLUMN_NIC = ?", arrayOf(nic))
    }

    /**
     * Delete all EV owners from local database
     * @return Number of rows affected
     */
    fun deleteAllEVOwners(): Int {
        val db = writableDatabase
        return db.delete(TABLE_EV_OWNERS, null, null)
    }

    /**
     * Debug method to check if EV owner table exists and count records
     */
    fun debugEVOwnerTable(): String {
        val db = readableDatabase
        val cursor = db.rawQuery("SELECT name FROM sqlite_master WHERE type='table' AND name='$TABLE_EV_OWNERS'", null)
        val tableExists = cursor.count > 0
        cursor.close()

        val countCursor = db.rawQuery("SELECT COUNT(*) FROM $TABLE_EV_OWNERS", null)
        var recordCount = 0
        if (countCursor.moveToFirst()) {
            recordCount = countCursor.getInt(0)
        }
        countCursor.close()

        return "Table exists: $tableExists, Record count: $recordCount"
    }

    /**
     * Debug method to log the actual SQL being executed
     */
    fun debugInsertEVOwner(owner: EVOwner): ContentValues {
        return ContentValues().apply {
            put(COLUMN_NIC, owner.nic)
            put(COLUMN_FIRST_NAME, owner.firstName)
            put(COLUMN_LAST_NAME, owner.lastName)
            put(COLUMN_DATE_OF_BIRTH, owner.dateOfBirth)
            put(COLUMN_GENDER, owner.gender)
            put(COLUMN_EMAIL, owner.email)
            put(COLUMN_PHONE, owner.phoneNumber)
            put(COLUMN_OWNER_ADDRESS, owner.address)
            put(COLUMN_PASSWORD, owner.password)
            put(COLUMN_VEHICLE_TYPE, owner.vehicleType)
            put(COLUMN_VEHICLE_MODEL, owner.vehicleModel)
            put(COLUMN_VEHICLE_PLATE, owner.vehiclePlateNumber)
            put(COLUMN_BATTERY_CAPACITY, owner.batteryCapacity)
            put(COLUMN_COMPATIBLE_CHARGERS, owner.compatibleChargerTypes)
            put(COLUMN_OWNER_IS_ACTIVE, if (owner.isActive) 1 else 0)
        }
    }
}