namespace webservice.dto
{
    public class CreateBookingRequest
    {
        public string StationId { get; set; }
        public string NIC { get; set; }
        public DateTime ReservationDate { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string ChargerType { get; set; }
    }
}
