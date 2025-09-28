namespace webservice.dto
{
    public class CancelBookingRequest
    {
        public string CancelledBy { get; set; } 
        public string CancellationReason { get; set; }
    }
}
