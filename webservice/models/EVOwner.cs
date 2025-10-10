/*
 * EVOwner.cs
 * 
 * Model class representing an Electric Vehicle owner/user.
 * Contains personal information, vehicle details, and account status.
 * Uses NIC (National Identity Card) as the primary identifier.
 * 
 * Dependencies:
 * - MongoDB.Bson for document storage
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace webservice.models
{
    public class EVOwner
    {
        [BsonId]
        [BsonElement("_id")]
        public string NIC { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string Password { get; set; }
        public string VehicleType { get; set; } // "Car", "Bike"
        public string VehicleModel { get; set; }
        public string VehiclePlateNumber { get; set; }
        public string BatteryCapacity { get; set; }
        public string CompatibleChargerTypes { get; set; } // "AC,DC,Super"
        public bool IsActive { get; set; }
        public DateTime RegistrationDate { get; set; }

    }

}
