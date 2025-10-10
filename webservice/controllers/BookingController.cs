/*
 * BookingController.cs
 * 
 * API Controller for managing EV charging station bookings.
 * Provides endpoints for creating, updating, canceling, and querying bookings,
 * as well as checking slot availability and managing booking statuses.
 * 
 * Dependencies: BookingService, StationService, MongoDB
 */

using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using webservice.dto;
using webservice.models;
using webservice.services;
using webservice.data;
using MongoDB.Driver;

namespace webservice.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly BookingService _service = new BookingService();
        private readonly StationService _stationService;

        // Retrieves all bookings from the database
        [HttpGet]
        public async Task<ActionResult<List<Booking>>> GetAll()
        {
            var bookings = await _service.GetAllBookingsAsync();
            return Ok(bookings);
        }

        // Retrieves a specific booking by its unique identifier
        [HttpGet("{id}")]
        public async Task<ActionResult<Booking>> GetById(string id)
        {
            var booking = await _service.GetBookingByIdAsync(id);
            if (booking == null) return NotFound();
            return Ok(booking);
        }

        // Retrieves all bookings associated with a specific charging station
        [HttpGet("station/{stationId}")]
        public async Task<ActionResult<List<Booking>>> GetByStationId(string stationId)
        {
            var bookings = await _service.GetBookingsByStationIdAsync(stationId);
            return Ok(bookings);
        }

        // Retrieves all bookings for a specific slot
        [HttpGet("slot/{slotId}")]
        public async Task<ActionResult<List<Booking>>> GetBySlotId(string slotId)
        {
            var bookings = await _service.GetBookingsBySlotIdAsync(slotId);
            return Ok(bookings);
        }

        // Retrieves all bookings with a specific status (e.g., Active, Completed, Cancelled)
        [HttpGet("status/{status}")]
        public async Task<ActionResult<List<Booking>>> GetByStatus(string status)
        {
            var bookings = await _service.GetBookingsByStatusAsync(status);
            return Ok(bookings);
        }

        // Retrieves all bookings within a specified date range
        [HttpGet("date-range")]
        public async Task<ActionResult<List<Booking>>> GetByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var bookings = await _service.GetBookingsByDateRangeAsync(startDate, endDate);
            return Ok(bookings);
        }

        // Checks available slots for a given station, date, time range, and charger type
        [HttpGet("availability")]
        public async Task<ActionResult<List<Slot>>> CheckAvailability(
            [FromQuery] string stationId,
            [FromQuery] DateTime reservationDate,
            [FromQuery] string startTime,
            [FromQuery] string endTime,
            [FromQuery] string chargerType)
        {
            if (!TimeSpan.TryParse(startTime, out TimeSpan start) || !TimeSpan.TryParse(endTime, out TimeSpan end))
            {
                return BadRequest("Invalid time format. Use HH:MM:SS format.");
            }

            var availableSlots = await _service.GetAvailableSlotsAsync(stationId, reservationDate, start, end, chargerType);
            return Ok(availableSlots);
        }

        // Creates a new booking with validation and slot availability checking
        [HttpPost("create")]
        public async Task<ActionResult> CreateBooking([FromBody] CreateBookingRequest request)
        {
            // Basic validation
            if (string.IsNullOrEmpty(request.StationId) || string.IsNullOrEmpty(request.NIC) || string.IsNullOrEmpty(request.StartTime) || string.IsNullOrEmpty(request.EndTime) || string.IsNullOrEmpty(request.ChargerType))
            {
                return BadRequest(new { message = "Missing required fields" });
            }
            if (!TimeSpan.TryParse(request.StartTime, out TimeSpan start) || !TimeSpan.TryParse(request.EndTime, out TimeSpan end))
            {
                return BadRequest("Invalid time format. Use HH:MM:SS format.");
            }

            var result = await _service.CreateBookingAsync(request.StationId, request.NIC, request.ReservationDate, start, end, request.ChargerType, request.SlotId);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            var createdBooking = result.Booking;
            if (createdBooking == null)
            {
                return BadRequest(new { message = "Failed to create booking" });
            }

            return CreatedAtAction(nameof(GetById), new { id = createdBooking.Id }, new
            {
                message = result.Message,
                booking = createdBooking
            });
        }

        // Updates an existing booking with new date, time, and charger type information
        [HttpPut("{id}/update")]
        public async Task<ActionResult> UpdateBooking(string id, [FromBody] UpdateBookingRequest request)
        {
            if (!TimeSpan.TryParse(request.StartTime, out TimeSpan start) || !TimeSpan.TryParse(request.EndTime, out TimeSpan end))
            {
                return BadRequest("Invalid time format. Use HH:MM:SS format.");
            }

            var result = await _service.UpdateBookingAsync(id, request.ReservationDate, start, end, request.ChargerType);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message });
        }

        // Cancels a booking with reason and user information
        [HttpPost("{id}/cancel")]
        public async Task<ActionResult> CancelBooking(string id, [FromBody] CancelBookingRequest request)
        {
            var result = await _service.CancelBookingAsync(id, request.CancelledBy, request.CancellationReason);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message });
        }

        // Updates the status of a booking (e.g., Active, Completed, Cancelled)
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateStatusRequest request)
        {
            var success = await _service.UpdateBookingStatusAsync(id, request.Status);
            if (!success) return NotFound();
            return Ok(new { message = "Status updated successfully" });
        }

        // Marks a booking's QR code as scanned for check-in verification
        [HttpPost("{id}/scan-qr")]
        public async Task<IActionResult> ScanQRCode(string id)
        {
            var booking = await _service.GetBookingByIdAsync(id);
            if (booking == null) return NotFound();

            if (booking.QRCodeScanned)
            {
                return BadRequest(new { message = "QR Code has already been scanned" });
            }

            var success = await _service.ScanQRCodeAsync(id);
            if (!success) return BadRequest(new { message = "Failed to scan QR code" });

            return Ok(new { message = "QR Code scanned successfully" });
        }

        // Updates the energy consumed and cost for a completed booking
        [HttpPatch("{id}/energy-cost")]
        public async Task<IActionResult> UpdateEnergyAndCost(string id, [FromBody] UpdateEnergyCostRequest request)
        {
            var success = await _service.UpdateEnergyAndCostAsync(id, request.EnergyConsumed, request.Cost);
            if (!success) return NotFound();
            return Ok(new { message = "Energy and cost updated successfully" });
        }

        // Deletes a booking from the database
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteBookingAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
        
        // Constructor initializes the controller with required services
        public BookingController(BookingService service, StationService stationService)
        {
            _service = service;
            _stationService = stationService;
        }

        // Retrieves the charging rate information for a specific booking
        [HttpGet("{id}/charging-rate")]
        public async Task<ActionResult> GetChargingRate(string id)
        {
            var booking = await _service.GetBookingByIdAsync(id);
            if (booking == null) return NotFound();

            var station = await _stationService.GetStationByIdAsync(booking.StationId);
            if (station == null) return NotFound(new { message = "Station not found" });

            // Find the slot type for this slot by SlotName (ChargerType)
            var db = new DBConnect();
            var filter = Builders<SlotType>.Filter.Eq(st => st.SlotName, booking.ChargerType);
            var slotType = await db.SlotTypes.Find(filter).FirstOrDefaultAsync();
            if (slotType == null) return NotFound(new { message = "Slot type not found" });

            var rate = slotType.Rate;

            return Ok(new
            {
                chargingRate = rate,
                chargerType = booking.ChargerType,
                stationId = station.Id,
                stationName = station.StationName
            });
        }
    }

}