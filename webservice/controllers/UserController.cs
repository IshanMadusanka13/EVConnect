using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using webservice.data;
using webservice.models;
using webservice.dto;
using System.Security.Cryptography;
using System.Text;

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
