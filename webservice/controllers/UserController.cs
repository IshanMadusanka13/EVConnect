using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using webservice.data;
using webservice.models;
using webservice.dto;
using System.Security.Cryptography;
using System.Text;
using MongoDB.Bson;

namespace webservice.controllers
{
    [ApiController]
    [Route("users")]
    public class UsersController : ControllerBase
    {
        private readonly DBConnect _db;

        public UsersController()
        {
            _db = new DBConnect();
        }

        // GET: api/users
        [HttpGet]
        public IActionResult GetAllUsers()
        {
            try
            {
                var users = _db.Users.Find(FilterDefinition<User>.Empty).ToList();
                return Ok(users);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // GET: api/users/{id}
// Fetch a specific user by ObjectId
[HttpGet("{id}")]
public IActionResult GetUserById(string id)
{
    try
    {
        // Convert string to ObjectId
        var objectId = new ObjectId(id);

        // Find user by Id
        var filter = Builders<User>.Filter.Eq(u => u.Id, id);
        var user = _db.Users.Find(filter).FirstOrDefault();

        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(user);
    }
    catch (FormatException)
    {
        // Invalid ObjectId format
        return BadRequest(new { message = "Invalid user ID" });
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = ex.Message });
    }
}


        // POST: api/users/register
        [HttpPost("register")]
        public IActionResult Register([FromBody] UserDTO dto)
        {
            try
            {
                if (dto == null)
                    return BadRequest(new { message = "Invalid data" });

                // Optional: check if email or EmployeeId already exists
                var filter = Builders<User>.Filter.Eq(u => u.Email, dto.Email);
                var existing = _db.Users.Find(filter).FirstOrDefault();
                if (existing != null)
                    return BadRequest(new { message = "Email already exists" });

                // Hash password before storing (recommended)
                var hashedPassword = HashPassword(dto.Password);

                var user = new User
                {
                    EmployeeId = dto.EmployeeId,
                    FirstName = dto.FirstName,
                    LastName = dto.LastName,
                    PhoneNumber = dto.PhoneNumber,
                    Email = dto.Email,
                    Password = hashedPassword,
                    Role = dto.Role,
                    IsActive = dto.IsActive
                };

                _db.Users.InsertOne(user);

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = ex.Message });
            }
        }

        // PUT: api/users/{id}  
         // needed for ObjectId

[HttpPut("{id}")]
public IActionResult UpdateUser(string id, [FromBody] UserUpdatedto dto)
{
    try
    {
        // Convert string id to ObjectId
        var objectId = new ObjectId(id);

        var filter = Builders<User>.Filter.Eq(u => u.Id, id); // make sure User.Id is ObjectId
        var update = Builders<User>.Update
            .Set(u => u.FirstName, dto.FirstName)
            .Set(u => u.LastName, dto.LastName)
            .Set(u => u.Email, dto.Email)
            .Set(u => u.PhoneNumber, dto.PhoneNumber)
            .Set(u => u.Role, dto.Role)
            .Set(u => u.IsActive, dto.IsActive);

        var result = _db.Users.UpdateOne(filter, update);

        if (result.ModifiedCount == 0)
            return NotFound(new { message = "User not found or no changes made" });

        var updatedUser = _db.Users.Find(filter).FirstOrDefault();
        return Ok(updatedUser);
    }
    catch (Exception ex)
    {
        return StatusCode(500, new { message = ex.Message });
    }
}


        // Simple SHA256 hash (can use stronger hash + salt in production)
        private string HashPassword(string password)
        {
            using (SHA256 sha = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
    }
}
