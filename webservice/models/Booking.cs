using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace webservice.models
{
    public class Booking
    {
        public string Id { get; set; }
        public string NIC { get; set; }
        public string StationId { get; set; }
        public string SlotId { get; set; }
        public DateTime ReservationDate { get; set; }
        public TimeSpan StartTime { get; set; }
        public TimeSpan EndTime { get; set; }
        public DateTime BookingDateTime { get; set; }
        public string Status { get; set; }
        public decimal EnergyConsumed { get; set; }
        public string ChargerType { get; set; }
        public decimal Cost { get; set; }
        public string QRCodeData { get; set; }
        public bool QRCodeScanned { get; set; }
        public DateTime? QRScanTime { get; set; }
        public bool IsCancelled { get; set; }
        public DateTime? CancellationDate { get; set; }
        public string CancelledBy { get; set; } 
        public string CancellationReason { get; set; }

    }

}
