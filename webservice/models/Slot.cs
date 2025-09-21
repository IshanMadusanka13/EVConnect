using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace webservice.models
{
    public class Slot
    {
        public string Id { get; set; }
        public string StationId { get; set; }
        public int SlotNumber { get; set; }
        public DateTime SlotTime { get; set; }
        public int DurationMinutes { get; set; }
        public bool IsAvailable { get; set; }
        public string? ReservedBy { get; set; } 

    }

}
