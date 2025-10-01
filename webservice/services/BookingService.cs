using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;
using webservice.data;
using webservice.models;

namespace webservice.services
{
    public class BookingService
    {
        private readonly DBConnect _db;
        private readonly IMongoCollection<Booking> _bookings;
        private readonly SlotService _slotService;
        private readonly StationScheduleService _stationScheduleService;

        public BookingService()
        {
            _db = new DBConnect();
            _bookings = _db.Bookings;
            _slotService = new SlotService();
            _stationScheduleService = new StationScheduleService();
        }

        // Basic CRUD operations
        public async Task<List<Booking>> GetAllBookingsAsync()
        {
            return await _bookings.Find(_ => true).ToListAsync();
        }

        public async Task<Booking> GetBookingByIdAsync(string id)
        {
            return await _bookings.Find(b => b.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<Booking>> GetBookingsByStationIdAsync(string stationId)
        {
            return await _bookings.Find(b => b.StationId == stationId).ToListAsync();
        }

        public async Task<List<Booking>> GetBookingsBySlotIdAsync(string slotId)
        {
            return await _bookings.Find(b => b.SlotId == slotId).ToListAsync();
        }

        public async Task<List<Booking>> GetBookingsByStatusAsync(string status)
        {
            return await _bookings.Find(b => b.Status == status).ToListAsync();
        }

        public async Task<List<Booking>> GetBookingsByDateRangeAsync(DateTime startDate, DateTime endDate)
        {
            return await _bookings.Find(b => b.ReservationDate >= startDate && b.ReservationDate <= endDate).ToListAsync();
        }

        // Create new booking with availability check and automatic slot assignment
        public async Task<(bool Success, string Message, Booking Booking)> CreateBookingAsync(string stationId, DateTime reservationDate, TimeSpan startTime, TimeSpan endTime, string chargerType)
        {
            // Validate reservation date is within 7 days from now
            var bookingDateTime = DateTime.Now;
            var daysDifference = (reservationDate.Date - bookingDateTime.Date).Days;
            
            if (daysDifference < 0)
            {
                return (false, "Cannot book for past dates", null);
            }
            
            if (daysDifference > 7)
            {
                return (false, "Reservations can only be made up to 7 days in advance", null);
            }

            // Validate time range
            if (startTime >= endTime)
            {
                return (false, "Start time must be before end time", null);
            }

            // Check if station is open during requested time
            var isOpen = await _stationScheduleService.IsStationOpenAsync(stationId, reservationDate.DayOfWeek, startTime);
            var isOpenAtEnd = await _stationScheduleService.IsStationOpenAsync(stationId, reservationDate.DayOfWeek, endTime);
            
            if (!isOpen || !isOpenAtEnd)
            {
                return (false, "Station is not open during the requested time", null);
            }

            // Find available slot
            var availableSlot = await FindAvailableSlotAsync(stationId, reservationDate, startTime, endTime, chargerType);
            
            if (availableSlot == null)
            {
                return (false, "No available slots for the requested time and charger type", null);
            }

            // Create booking
            var booking = new Booking
            {
                Id = Guid.NewGuid().ToString(),
                StationId = stationId,
                SlotId = availableSlot.Id,
                ReservationDate = reservationDate,
                StartTime = startTime,
                EndTime = endTime,
                BookingDateTime = bookingDateTime,
                Status = "Pending",
                EnergyConsumed = 0,
                Cost = 0,
                QRCodeData = GenerateQRCodeData(),
                QRCodeScanned = false,
                QRScanTime = null,
                IsCancelled = false,
                CancellationDate = null,
                CancelledBy = null,
                CancellationReason = null
            };

            await _bookings.InsertOneAsync(booking);
            return (true, "Booking created successfully", booking);
        }

        // Update booking with time constraints
        public async Task<(bool Success, string Message)> UpdateBookingAsync(string id, DateTime newReservationDate, TimeSpan newStartTime, TimeSpan newEndTime, string newChargerType)
        {
            var booking = await GetBookingByIdAsync(id);
            if (booking == null)
            {
                return (false, "Booking not found");
            }

            if (booking.IsCancelled)
            {
                return (false, "Cannot update cancelled booking");
            }

            if (booking.Status == "Completed")
            {
                return (false, "Cannot update completed booking");
            }

            // Check if update is at least 12 hours before reservation
            var hoursUntilReservation = (booking.ReservationDate.Date.Add(booking.StartTime) - DateTime.Now).TotalHours;
            if (hoursUntilReservation < 12)
            {
                return (false, "Bookings can only be updated at least 12 hours before the reservation time");
            }

            // Validate new reservation date is within 7 days
            var daysDifference = (newReservationDate.Date - DateTime.Now.Date).Days;
            if (daysDifference < 0 || daysDifference > 7)
            {
                return (false, "New reservation date must be within 7 days from today");
            }

            // Validate time range
            if (newStartTime >= newEndTime)
            {
                return (false, "Start time must be before end time");
            }

            // Check station availability for new time
            var isOpen = await _stationScheduleService.IsStationOpenAsync(booking.StationId, newReservationDate.DayOfWeek, newStartTime);
            var isOpenAtEnd = await _stationScheduleService.IsStationOpenAsync(booking.StationId, newReservationDate.DayOfWeek, newEndTime);
            
            if (!isOpen || !isOpenAtEnd)
            {
                return (false, "Station is not open during the new requested time");
            }

            // Find available slot for new time (excluding current booking)
            var availableSlot = await FindAvailableSlotAsync(booking.StationId, newReservationDate, newStartTime, newEndTime, newChargerType, id);
            
            if (availableSlot == null)
            {
                return (false, "No available slots for the new requested time and charger type");
            }

            // Update booking
            var update = Builders<Booking>.Update
                .Set(b => b.SlotId, availableSlot.Id)
                .Set(b => b.ReservationDate, newReservationDate)
                .Set(b => b.StartTime, newStartTime)
                .Set(b => b.EndTime, newEndTime);

            var result = await _bookings.UpdateOneAsync(b => b.Id == id, update);
            return (result.ModifiedCount > 0, result.ModifiedCount > 0 ? "Booking updated successfully" : "Failed to update booking");
        }

        // Cancel booking with time constraints
        public async Task<(bool Success, string Message)> CancelBookingAsync(string id, string cancelledBy, string cancellationReason)
        {
            var booking = await GetBookingByIdAsync(id);
            if (booking == null)
            {
                return (false, "Booking not found");
            }

            if (booking.IsCancelled)
            {
                return (false, "Booking is already cancelled");
            }

            if (booking.Status == "Completed")
            {
                return (false, "Cannot cancel completed booking");
            }

            // Check if cancellation is at least 12 hours before reservation
            var hoursUntilReservation = (booking.ReservationDate.Date.Add(booking.StartTime) - DateTime.Now).TotalHours;
            if (hoursUntilReservation < 12)
            {
                return (false, "Bookings can only be cancelled at least 12 hours before the reservation time");
            }

            var update = Builders<Booking>.Update
                .Set(b => b.IsCancelled, true)
                .Set(b => b.CancellationDate, DateTime.Now)
                .Set(b => b.CancelledBy, cancelledBy)
                .Set(b => b.CancellationReason, cancellationReason)
                .Set(b => b.Status, "Cancelled");

            var result = await _bookings.UpdateOneAsync(b => b.Id == id, update);
            return (result.ModifiedCount > 0, result.ModifiedCount > 0 ? "Booking cancelled successfully" : "Failed to cancel booking");
        }

        // Check availability for a specific time slot
        public async Task<List<Slot>> GetAvailableSlotsAsync(string stationId, DateTime reservationDate, TimeSpan startTime, TimeSpan endTime, string chargerType)
        {
            // Get all operational slots for the station and charger type
            var allSlots = await _slotService.GetSlotsByStationIdAsync(stationId);
            var availableSlots = allSlots.Where(s => s.IsOperational && s.ChargerType == chargerType).ToList();

            // Get existing bookings for the same date and overlapping times
            var existingBookings = await GetBookingsForDateAndTimeRangeAsync(stationId, reservationDate, startTime, endTime);

            // Remove slots that are already booked during the requested time
            var bookedSlotIds = existingBookings.Select(b => b.SlotId).ToHashSet();
            availableSlots = availableSlots.Where(s => !bookedSlotIds.Contains(s.Id)).ToList();

            return availableSlots;
        }

        // Private helper methods
        private async Task<Slot> FindAvailableSlotAsync(string stationId, DateTime reservationDate, TimeSpan startTime, TimeSpan endTime, string chargerType, string excludeBookingId = null)
        {
            var availableSlots = await GetAvailableSlotsAsync(stationId, reservationDate, startTime, endTime, chargerType);
            
            // If updating an existing booking, we need to exclude it from conflict checking
            if (!string.IsNullOrEmpty(excludeBookingId))
            {
                var existingBookings = await GetBookingsForDateAndTimeRangeAsync(stationId, reservationDate, startTime, endTime);
                var conflictingBookings = existingBookings.Where(b => b.Id != excludeBookingId).ToList();
                var conflictingSlotIds = conflictingBookings.Select(b => b.SlotId).ToHashSet();
                
                // Re-filter available slots excluding conflicts from other bookings
                var allSlots = await _slotService.GetSlotsByStationIdAsync(stationId);
                availableSlots = allSlots.Where(s => s.IsOperational && s.ChargerType == chargerType && !conflictingSlotIds.Contains(s.Id)).ToList();
            }

            return availableSlots.FirstOrDefault();
        }

        private async Task<List<Booking>> GetBookingsForDateAndTimeRangeAsync(string stationId, DateTime reservationDate, TimeSpan startTime, TimeSpan endTime)
        {
            var bookings = await _bookings.Find(b => 
                b.StationId == stationId && 
                b.ReservationDate.Date == reservationDate.Date && 
                !b.IsCancelled && 
                b.Status != "NoShow" &&
                ((b.StartTime < endTime && b.EndTime > startTime)) // Time overlap check
            ).ToListAsync();

            return bookings;
        }

        private string GenerateQRCodeData()
        {
            return Guid.NewGuid().ToString("N").ToUpper();
        }

        // Additional utility methods
        public async Task<bool> UpdateBookingStatusAsync(string id, string status)
        {
            var update = Builders<Booking>.Update.Set(b => b.Status, status);
            var result = await _bookings.UpdateOneAsync(b => b.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> ScanQRCodeAsync(string id)
        {
            var update = Builders<Booking>.Update
                .Set(b => b.QRCodeScanned, true)
                .Set(b => b.QRScanTime, DateTime.Now);
            
            var result = await _bookings.UpdateOneAsync(b => b.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> UpdateEnergyAndCostAsync(string id, decimal energyConsumed, decimal cost)
        {
            var update = Builders<Booking>.Update
                .Set(b => b.EnergyConsumed, energyConsumed)
                .Set(b => b.Cost, cost);
            
            var result = await _bookings.UpdateOneAsync(b => b.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteBookingAsync(string id)
        {
            var result = await _bookings.DeleteOneAsync(b => b.Id == id);
            return result.DeletedCount > 0;
        }
    }
}