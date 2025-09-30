namespace webservice.dto
{
    public class CreateSlotRequest
    {
        public string StationId { get; set; }
        public decimal AcCount { get; set; }
        public decimal DcCount { get; set; }
        public decimal AcRate { get; set; }
        public decimal DcRate { get; set; }

    }
}
