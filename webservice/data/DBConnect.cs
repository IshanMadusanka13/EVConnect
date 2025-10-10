/*
 * DBConnect.cs
 * 
 * Database connection manager for MongoDB integration.
 * Provides centralized database access and collection management for the EVConnect system.
 * Handles connection initialization, error handling, and exposes collections for all entities.
 * 
 * Dependencies: MongoDB.Driver, System
 * Collections: Users, EVOwners, Stations, Bookings, Slots, StationSchedules, SlotTypes
 */

using System;
using MongoDB.Bson;
using MongoDB.Driver;
using webservice.models;

namespace webservice.data
{
    public class DBConnect
    {
        /// <summary>
        /// Reference to the MongoDB database instance
        /// </summary>
        private readonly IMongoDatabase _database;

        /// <summary>
        /// MongoDB client instance for database operations
        /// </summary>
        private readonly IMongoClient _client;

        /// <summary>
        /// MongoDB connection string with authentication and cluster details
        /// </summary>
        private const string connectionUri = "mongodb+srv://apex:123@cluster0.xxfzdsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

        /// <summary>
        /// Initializes a new instance of the DBConnect class.
        /// Establishes connection to MongoDB cluster and initializes the database.
        /// Throws an exception if connection cannot be established.
        /// </summary>
        public DBConnect()
        {
            try
            {
                var settings = MongoClientSettings.FromConnectionString(connectionUri);
                settings.ServerApi = new ServerApi(ServerApiVersion.V1);

                var client = new MongoClient(settings);
                _client = client;

                _database = _client.GetDatabase("EVChargingDB");

                var result = client.GetDatabase("EVChargingDB").RunCommand<BsonDocument>(new BsonDocument("ping", 1));
                Console.WriteLine("Successfully connected to MongoDB!");

            }
            catch (Exception ex)
            {
                Console.WriteLine($"MongoDB connection error: {ex.Message}");
                throw;
            }
        }

        /// <summary>
        /// Collection for managing system users including administrators and station managers
        /// </summary>
        public IMongoCollection<User> Users => _database.GetCollection<User>("Users");

        /// <summary>
        /// Collection for managing EV owner profiles and their vehicle information
        /// </summary>
        public IMongoCollection<EVOwner> EVOwners => _database.GetCollection<EVOwner>("EVOwners");

        /// <summary>
        /// Collection for managing charging station details and locations
        /// </summary>
        public IMongoCollection<Station> Stations => _database.GetCollection<Station>("Stations");

        /// <summary>
        /// Collection for managing charging slot reservations and booking history
        /// </summary>
        public IMongoCollection<Booking> Bookings => _database.GetCollection<Booking>("Bookings");

        /// <summary>
        /// Collection for managing individual charging slots within stations
        /// </summary>
        public IMongoCollection<Slot> Slots => _database.GetCollection<Slot>("Slots");

        /// <summary>
        /// Collection for managing station operating hours and availability schedules
        /// </summary>
        public IMongoCollection<StationSchedule> StationSchedules => _database.GetCollection<StationSchedule>("StationSchedules");

        /// <summary>
        /// Collection for managing different types of charging slots and their specifications
        /// </summary>
        public IMongoCollection<SlotType> SlotTypes => _database.GetCollection<SlotType>("SlotTypes");

        /// <summary>
        /// Exposes the MongoDB client instance to allow services to start sessions and transactions.
        /// This property enables advanced MongoDB operations like multi-document transactions.
        /// </summary>
        public IMongoClient Client => _client;

    }
}