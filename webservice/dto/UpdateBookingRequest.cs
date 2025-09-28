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
