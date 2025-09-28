namespace webservice.dto
{
    public class UpdateStatusRequest
    {
        public string Status { get; set; } // "Pending", "Confirmed", "Completed", "Cancelled", "NoShow"
    }
}
