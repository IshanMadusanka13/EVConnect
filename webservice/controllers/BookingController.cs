using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using webservice.dto;
using webservice.models;
using webservice.services;

namespace webservice.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class BookingController : ControllerBase
    {
        private readonly BookingService _service = new BookingService();

        [HttpGet]
        public async Task<ActionResult<List<Booking>>> GetAll()
        {
            var bookings = await _service.GetAllBookingsAsync();
            return Ok(bookings);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Booking>> GetById(string id)
        {
            var booking = await _service.GetBookingByIdAsync(id);
            if (booking == null) return NotFound();
            return Ok(booking);
        }

        [HttpGet("station/{stationId}")]
        public async Task<ActionResult<List<Booking>>> GetByStationId(string stationId)
        {
            var bookings = await _service.GetBookingsByStationIdAsync(stationId);
            return Ok(bookings);
        }

        [HttpGet("slot/{slotId}")]
        public async Task<ActionResult<List<Booking>>> GetBySlotId(string slotId)
        {
            var bookings = await _service.GetBookingsBySlotIdAsync(slotId);
            return Ok(bookings);
        }

        [HttpGet("status/{status}")]
        public async Task<ActionResult<List<Booking>>> GetByStatus(string status)
        {
            var bookings = await _service.GetBookingsByStatusAsync(status);
            return Ok(bookings);
        }

        [HttpGet("date-range")]
        public async Task<ActionResult<List<Booking>>> GetByDateRange([FromQuery] DateTime startDate, [FromQuery] DateTime endDate)
        {
            var bookings = await _service.GetBookingsByDateRangeAsync(startDate, endDate);
            return Ok(bookings);
        }

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

        [HttpPost("create")]
        public async Task<ActionResult> CreateBooking([FromBody] CreateBookingRequest request)
        {
            if (!TimeSpan.TryParse(request.StartTime, out TimeSpan start) || !TimeSpan.TryParse(request.EndTime, out TimeSpan end))
            {
                return BadRequest("Invalid time format. Use HH:MM:SS format.");
            }

            var result = await _service.CreateBookingAsync(request.StationId, request.ReservationDate, start, end, request.ChargerType);
            
            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return CreatedAtAction(nameof(GetById), new { id = result.Booking.Id }, new 
            { 
                message = result.Message, 
                booking = result.Booking 
            });
        }

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

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(string id, [FromBody] UpdateStatusRequest request)
        {
            var success = await _service.UpdateBookingStatusAsync(id, request.Status);
            if (!success) return NotFound();
            return Ok(new { message = "Status updated successfully" });
        }

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

        [HttpPatch("{id}/energy-cost")]
        public async Task<IActionResult> UpdateEnergyAndCost(string id, [FromBody] UpdateEnergyCostRequest request)
        {
            var success = await _service.UpdateEnergyAndCostAsync(id, request.EnergyConsumed, request.Cost);
            if (!success) return NotFound();
            return Ok(new { message = "Energy and cost updated successfully" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteBookingAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }

}