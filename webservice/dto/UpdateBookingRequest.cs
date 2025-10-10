/*
 * UpdateBookingRequest.cs
 * 
 * DTO for modifying existing booking details.
 * Allows updating reservation date, time window, and charger type
 * while maintaining booking consistency and availability rules.
 */

namespace webservice.dto
{
    public class UpdateBookingRequest
    {
        public DateTime ReservationDate { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string ChargerType { get; set; }
    }
}
