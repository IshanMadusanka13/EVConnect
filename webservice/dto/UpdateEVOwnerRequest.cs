namespace webservice.dto
{
    public class UpdateEVOwnerRequest
        {
            public string FirstName { get; set; }
            public string LastName { get; set; }
            public string DateOfBirth { get; set; }
            public string Gender { get; set; }
            public string Email { get; set; }
            public string PhoneNumber { get; set; }
            public string Address { get; set; }
            public string VehicleType { get; set; }
            public string VehicleModel { get; set; }
            public string VehiclePlateNumber { get; set; }
            public string BatteryCapacity { get; set; }
            public string CompatibleChargerTypes { get; set; }
        }
}