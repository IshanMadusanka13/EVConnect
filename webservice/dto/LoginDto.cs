/*
 * LoginDto.cs
 * 
 * DTO for user authentication requests.
 * Contains email and password credentials for user login.
 * Used in conjunction with JWT token generation for authentication.
 */

namespace webservice.Models
{
    public class LoginDto
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }
}
