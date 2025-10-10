/*
 * Station.cs
 * 
 * Model class representing an EV charging station.
 * Contains information about the station's location, operational status,
 * and the operator responsible for managing it.
 * 
 * Relationships:
 * - User (via OperatorId)
 * - Slots (one-to-many)
 * - StationSchedule (one-to-many)
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace webservice.models
{
    public class Station
    {
        public string? Id { get; set; }
        public string? StationName { get; set; }
        public string? Address { get; set; }
        public double? Latitude { get; set; }
        public double? Longitude { get; set; }
        public bool? IsActive { get; set; }
        public string? OperatorId { get; set; }
    }

}
