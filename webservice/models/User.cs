
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using webservice.models;

namespace webservice.models
{
    [BsonIgnoreExtraElements]
    public class User
    {
    [BsonId]
    [BsonRepresentation(BsonType.ObjectId)]
    public string? Id { get; set; }
        public string? EmployeeId { get; set; }
        public string? FirstName { get; set; }
        public string? LastName { get; set; }
        public string? PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string? Password { get; set; }
        public string? Role { get; set; }
        public bool IsActive { get; set; }
    }
}
