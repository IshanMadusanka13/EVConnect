using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace webservice.models
{
    public class Slot
    {
    public string? Id { get; set; }
    public string? SlotNumber { get; set; }
    public string? ChargerType { get; set; }
    public bool IsOperational { get; set; }
    public string? StationId { get; set; }
    }

}
