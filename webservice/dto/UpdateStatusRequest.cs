namespace webservice.dto
{
    /// <summary>
    /// Data transfer object for updating the status of a booking or charging session.
    /// Used by controllers to track the lifecycle of a booking from pending through completion.
    /// Supported statuses are: "Pending", "Confirmed", "Completed", "Cancelled", and "NoShow".
    /// </summary>
    public class UpdateStatusRequest
    {
        /// <summary>
        /// The new status to be applied to the booking or charging session.
        /// Valid values are: "Pending", "Confirmed", "Completed", "Cancelled", and "NoShow".
        /// Each status represents a different stage in the booking lifecycle.
        /// </summary>
        public string Status { get; set; } = string.Empty;
    }
}
