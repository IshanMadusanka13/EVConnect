using System;
using MongoDB.Bson;
using MongoDB.Driver;
using webservice.models;

namespace webservice.data
{
    public class DBConnect
    {
        private readonly IMongoDatabase _database;

        private const string connectionUri = "mongodb+srv://apex:123@cluster0.xxfzdsj.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

        public DBConnect()
        {
            try
            {
                var settings = MongoClientSettings.FromConnectionString(connectionUri);
                settings.ServerApi = new ServerApi(ServerApiVersion.V1);

                var client = new MongoClient(settings);

                _database = client.GetDatabase("EVChargingDB");

                var result = client.GetDatabase("evstation").RunCommand<BsonDocument>(new BsonDocument("ping", 1));
                Console.WriteLine("Pinged your deployment. You successfully connected to MongoDB!");

            }
            catch (Exception ex)
            {
                Console.WriteLine($"MongoDB connection error: {ex.Message}");
                throw;
            }
        }

        public IMongoCollection<User> Users => _database.GetCollection<User>("Users");
        public IMongoCollection<EVOwner> EVOwners => _database.GetCollection<EVOwner>("EVOwners");
        public IMongoCollection<Station> Stations => _database.GetCollection<Station>("Stations");
        public IMongoCollection<Booking> Bookings => _database.GetCollection<Booking>("Bookings");
        public IMongoCollection<Slot> Slots => _database.GetCollection<Slot>("Slots");

    }
}