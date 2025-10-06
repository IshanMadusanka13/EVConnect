using webservice.models;

namespace webservice.dto
{
    public class CreateStationRequest
    {
        public string? StationName { get; set; }
        public string? Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public string? OperatorId { get; set; }
        public List<StationSlots>? Slots { get; set; }
        public List<StationScheduleRequest>? Schedules { get; set; }

    }

    public class StationSlots
    {
        public SlotType Type { get; set; }
        public decimal Count { get; set; }
    }
    public class StationScheduleRequest
    {
        public DayOfWeek DayOfWeek { get; set; }
        public bool IsOpen { get; set; }
        public string? OpeningTime { get; set; }
        public string? ClosingTime { get; set; }
    }

}
