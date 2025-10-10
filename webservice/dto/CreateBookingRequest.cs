/*
 * CreateBookingRequest.cs
 * 
 * DTO for creating new charging station bookings.
 * Contains all necessary information for booking a charging slot,
 * including station, user, timing, and charger type details.
 * Optional SlotId allows for specific slot selection.
 */

namespace webservice.dto
{
    public class CreateBookingRequest
    {
        public string? StationId { get; set; } = null!;
        public string? NIC { get; set; } = null!;
        public DateTime ReservationDate { get; set; }
        public string? StartTime { get; set; } = null!;
        public string? EndTime { get; set; } = null!;
        public string? ChargerType { get; set; } = null!;
        // Optional slot id provided by frontend
        public string? SlotId { get; set; }
    }
}
