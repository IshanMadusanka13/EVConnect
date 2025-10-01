using System.Collections.Generic;
using webservice.models;

namespace webservice.dto
{
    public class StationDetailsResponse
    {
        public Station? Station { get; set; }
        public List<Slot>? Slots { get; set; }
        public List<StationSchedule>? Schedules { get; set; }
    }
}