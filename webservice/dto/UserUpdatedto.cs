
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace webservice.models
{
    /// <summary>
    /// Data transfer object for updating user information in MongoDB.
    /// Used by the User controller to handle user profile updates.
    /// Includes BsonId for MongoDB document mapping and ignores extra elements for schema flexibility.
    /// </summary>
    [BsonIgnoreExtraElements]
    public class UserUpdatedto
    {
        /// <summary>
        /// MongoDB document identifier
        /// </summary>
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        // public string Id { get; set; }

        /// <summary>
        /// Unique identifier for the employee in the organization
        /// </summary>
        public string EmployeeId { get; set; } = string.Empty;

        /// <summary>
        /// First name of the user
        /// </summary>
        public string FirstName { get; set; } = string.Empty;

        /// <summary>
        /// Last name of the user
        /// </summary>
        public string LastName { get; set; } = string.Empty;

        /// <summary>
        /// Contact phone number of the user
        /// </summary>
        public string PhoneNumber { get; set; } = string.Empty;

        /// <summary>
        /// Email address used for login and communications
        /// </summary>
        public string Email { get; set; } = string.Empty;

        /// <summary>
        /// Password for user authentication
        /// </summary>
        public string Password { get; set; } = string.Empty;

        /// <summary>
        /// User's role in the system (e.g., Admin, Station Manager)
        /// </summary>
        public string Role { get; set; } = string.Empty;

        /// <summary>
        /// Indicates whether the user account is currently active
        /// </summary>
        public bool IsActive { get; set; }
    }
}
