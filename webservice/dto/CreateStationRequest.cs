using webservice.models;

namespace webservice.dto
{
    public class CreateStationRequest
    {
        public string? StationName { get; set; }
        public string? Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public decimal AcChargingRate { get; set; }
        public decimal DcChargingRate { get; set; }
        public string? OperatorId { get; set; }
        public decimal AcCount { get; set; }
        public decimal DcCount { get; set; }

        public List<StationScheduleRequest>? Schedules { get; set; }

    }

    public class StationScheduleRequest
    {
        public DayOfWeek DayOfWeek { get; set; }
        public bool IsOpen { get; set; }
        public string? OpeningTime { get; set; }
        public string? ClosingTime { get; set; }
    }

}
