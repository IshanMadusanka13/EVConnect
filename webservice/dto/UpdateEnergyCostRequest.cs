namespace webservice.dto
{
    /// <summary>
    /// Data transfer object for updating energy consumption and cost details of a charging session.
    /// Used by station controllers to report the actual energy consumed and the associated cost
    /// after a charging session is completed.
    /// </summary>
    public class UpdateEnergyCostRequest
    {
        /// <summary>
        /// The amount of energy consumed during the charging session, measured in kilowatt-hours (kWh).
        /// </summary>
        public decimal EnergyConsumed { get; set; }

        /// <summary>
        /// The total cost of the charging session in the local currency.
        /// Calculated based on energy consumption and the station's rate settings.
        /// </summary>
        public decimal Cost { get; set; }
    }
}
