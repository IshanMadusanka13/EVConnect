/*
 * CancelBookingRequest.cs
 * 
 * DTO for handling booking cancellation requests.
 * Contains information about who cancelled the booking and the reason for cancellation.
 */

namespace webservice.dto
{
    public class CancelBookingRequest
    {
        public string CancelledBy { get; set; } 
        public string CancellationReason { get; set; }
    }
}
