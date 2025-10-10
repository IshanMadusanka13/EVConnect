/*
 * UserService.cs
 * 
 * Service class managing system user accounts and authentication.
 * Handles user creation, authentication, and profile management
 * with secure password handling and logging.
 * 
 * Features:
 * - User CRUD operations
 * - Secure password hashing using SHA256
 * - Authentication with email/password
 * - Operation logging
 * 
 * Dependencies:
 * - MongoDB for data persistence
 * - ILogger for operation logging
 * - System.Security.Cryptography for password hashing
 */

using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using MongoDB.Bson;
using MongoDB.Driver;
using Microsoft.Extensions.Logging;
using webservice.data;
using webservice.models;

namespace webservice.services
{
    public class UserService
    {
        private readonly DBConnect _db;
        private readonly IMongoCollection<User> _users;
        private readonly ILogger<UserService> _logger;

        public UserService(ILogger<UserService> logger)
        {
            _db = new DBConnect();
            _users = _db.Users;
            _logger = logger;
        }

        private string HashPassword(string password)
        {
            if (string.IsNullOrEmpty(password)) return string.Empty;
            using var sha = SHA256.Create();
            var bytes = Encoding.UTF8.GetBytes(password);
            var hash = sha.ComputeHash(bytes);
            return Convert.ToBase64String(hash);
        }

        public async Task<List<User>> GetAllUsersAsync()
        {
            _logger.LogInformation("Fetching all users");
            return await _users.Find(_ => true).ToListAsync();
        }

        public async Task<User?> GetUserByIdAsync(string id)
        {
            _logger.LogInformation($"Fetching user by id: {id}");
            return await _users.Find(u => u.Id == id).FirstOrDefaultAsync();
        }

        public async Task<User?> GetUserByEmailAsync(string email)
        {
            return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
        }

        public async Task<User> CreateUserAsync(User user)
        {
            _logger.LogInformation($"Creating user: {user.Email}");
            if (!string.IsNullOrEmpty(user.Password))
            {
                user.Password = HashPassword(user.Password);
            }

            // Ensure Id is null so Mongo will assign one
            if (string.IsNullOrEmpty(user.Id))
            {
                user.Id = ObjectId.GenerateNewId().ToString();
            }

            await _users.InsertOneAsync(user);
            return user;
        }

        public async Task<bool> UpdateUserAsync(string id, User user)
        {
            _logger.LogInformation($"Updating user: {id}");
            // If password is provided, hash it
            if (!string.IsNullOrEmpty(user.Password))
            {
                user.Password = HashPassword(user.Password);
            }

            var result = await _users.ReplaceOneAsync(u => u.Id == id, user);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteUserAsync(string id)
        {
            _logger.LogInformation($"Deleting user: {id}");
            var result = await _users.DeleteOneAsync(u => u.Id == id);
            return result.DeletedCount > 0;
        }

        public async Task<User?> LoginAsync(string? email, string? password)
        {
            _logger.LogInformation($"Login attempt for: {email}");
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password)) return null;
            var hashed = HashPassword(password);
            var user = await _users.Find(u => u.Email == email && u.Password == hashed).FirstOrDefaultAsync();
            return user;
        }
    }
}
