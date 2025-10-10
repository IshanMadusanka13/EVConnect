/*
 * CreateSlotRequest.cs
 * 
 * DTO for creating new charging slots at a station.
 * Contains the station ID and the type of charger for the new slot.
 * Used when adding individual charging slots to existing stations.
 */

using webservice.models;

namespace webservice.dto
{
    public class CreateSlotRequest
    {
        public string stationId { get; set; }
        public string chargerType { get; set; }

    }

}
