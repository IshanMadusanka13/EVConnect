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
