namespace webservice.dto
{
    /// <summary>
    /// Data transfer object for updating an existing EV owner's profile information.
    /// Contains both personal information and vehicle-specific details that can be modified.
    /// Used by the EVOwner controller to process profile update requests.
    /// </summary>
    public class UpdateEVOwnerRequest
    {
            /// <summary>
            /// First name of the EV owner
            /// </summary>
            public string FirstName { get; set; } = string.Empty;

            /// <summary>
            /// Last name of the EV owner
            /// </summary>
            public string LastName { get; set; } = string.Empty;

            /// <summary>
            /// Date of birth of the EV owner
            /// </summary>
            public DateTime DateOfBirth { get; set; }

            /// <summary>
            /// Gender of the EV owner
            /// </summary>
            public string Gender { get; set; } = string.Empty;

            /// <summary>
            /// Email address for communications and notifications
            /// </summary>
            public string Email { get; set; } = string.Empty;

            /// <summary>
            /// Contact phone number of the EV owner
            /// </summary>
            public string PhoneNumber { get; set; } = string.Empty;

            /// <summary>
            /// Residential or billing address of the EV owner
            /// </summary>
            public string Address { get; set; } = string.Empty;

            /// <summary>
            /// Type of electric vehicle owned (e.g., BEV, PHEV)
            /// </summary>
            public string VehicleType { get; set; } = string.Empty;

            /// <summary>
            /// Make and model of the electric vehicle
            /// </summary>
            public string VehicleModel { get; set; } = string.Empty;

            /// <summary>
            /// License plate number of the vehicle
            /// </summary>
            public string VehiclePlateNumber { get; set; } = string.Empty;

            /// <summary>
            /// Total battery capacity of the vehicle in kilowatt-hours (kWh)
            /// </summary>
            public string BatteryCapacity { get; set; } = string.Empty;

            /// <summary>
            /// List of charging connector types compatible with the vehicle
            /// </summary>
            public string CompatibleChargerTypes { get; set; } = string.Empty;
        }
}