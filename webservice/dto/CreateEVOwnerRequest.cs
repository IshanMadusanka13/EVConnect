/*
 * CreateEVOwnerRequest.cs
 * 
 * DTO for registering new EV owners in the system.
 * Contains comprehensive user profile information including
 * personal details, contact information, and vehicle specifications.
 */

namespace webservice.dto
{
    public class CreateEVOwnerRequest
    {
        public string NIC { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime DateOfBirth { get; set; }
        public string Gender { get; set; }
        public string Email { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string Password { get; set; }
        public string VehicleType { get; set; }
        public string VehicleModel { get; set; }
        public string VehiclePlateNumber { get; set; }
        public string BatteryCapacity { get; set; }
        public string CompatibleChargerTypes { get; set; }
    }
}