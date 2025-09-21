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
        public string EVOwnerId { get; set; }
        public string StationId { get; set; }
        public string SlotId { get; set; }

        public DateTime ReservationDateTime { get; set; }
        public DateTime CreatedDate { get; set; }
        public string Status { get; set; }

        public string QRCode { get; set; }
        public decimal? PaymentAmount { get; set; }
        public string? PaymentStatus { get; set; }
        public string? PaymentMethod { get; set; }

        public DateTime? ApprovedAt { get; set; }
        public string? ApprovedBy { get; set; }
        public DateTime? CancelledAt { get; set; }
        public string? CancelledBy { get; set; }
        public DateTime? CompletedAt { get; set; }
        public string? Notes { get; set; }
    }

}
