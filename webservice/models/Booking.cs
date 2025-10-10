/*
 * Booking.cs
 * 
 * Model class representing a charging station booking.
 * Contains all information about a booking including the user, station, slot,
 * timing details, status, and cancellation information if applicable.
 * 
 * Relationships:
 * - EVOwner (via NIC)
 * - Station (via StationId)
 * - Slot (via SlotId)
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace webservice.models
{
    public class Booking
    {
    public string? Id { get; set; } = null!;
    public string? NIC { get; set; } = null!;
    public string? StationId { get; set; } = null!;
    public string? SlotId { get; set; } = null!;
        public DateTime ReservationDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public DateTime BookingDateTime { get; set; }
    public string? Status { get; set; } = null!;
        public decimal EnergyConsumed { get; set; }
    public string? ChargerType { get; set; } = null!;
        public decimal Cost { get; set; }
    public string? QRCodeData { get; set; } = null!;
        public bool QRCodeScanned { get; set; }
        public DateTime? QRScanTime { get; set; }
        public bool IsCancelled { get; set; }
        public DateTime? CancellationDate { get; set; }
    public string? CancelledBy { get; set; } = null!; 
    public string? CancellationReason { get; set; } = null!;

    }

}
