using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using MongoDB.Driver;
using webservice.data;
using webservice.models;
using webservice.Services;

namespace webservice.controllers
{
    [ApiController]
    [Route("[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IMongoCollection<User> _users;
        private readonly DBConnect _db;
        private readonly JwtService _jwtService;

        // ✅ Constructor
        public AuthController(DBConnect db, JwtService jwtService)
        {
            _db = db;
            _jwtService = jwtService;
            _users = _db.Users;  // assuming DBConnect exposes Users collection
        }

        // ✅ Example Login Endpoint
        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            // Simple password hash check (in production, use a stronger hash + salt)
            request.Password = HashPassword(request.Password);
            var user = _users.Find(u => u.Email == request.Email && u.Password == request.Password).FirstOrDefault();

            if (user == null)
                return Unauthorized(new { message = "Invalid email or password" });

            var token = _jwtService.GenerateToken(user.Id, user.Email, user.Role);
            return Ok(new { Token = token, User = user });
        }

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

    // ✅ DTO for login
    public class LoginRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

     // Simple SHA256 hash (can use stronger hash + salt in production)
       // private string HashPassword(string password)
       // {
           // using (SHA256 sha = SHA256.Create())
           // {
              //  var bytes = Encoding.UTF8.GetBytes(password);
              //  var hash = sha.ComputeHash(bytes);
              //  return Convert.ToBase64String(hash);
          //  }
       // }
}
