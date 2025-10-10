/*
 * Slot.cs
 * 
 * Model class representing a charging slot within a station.
 * Contains information about the slot's number, type of charger,
 * operational status, and its associated station.
 * 
 * Relationships:
 * - Station (via StationId)
 * - SlotType (via ChargerType)
 */

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
