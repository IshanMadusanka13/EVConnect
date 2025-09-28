using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using webservice.data;
using webservice.models;

namespace webservice.services
{
    public class StationService
    {
        private readonly DBConnect _db;
        private readonly IMongoCollection<Station> _stations;

        public StationService()
        {
            _db = new DBConnect();
            _stations = _db.Stations;
        }

        public async Task<List<Station>> GetAllStationsAsync()
        {
            return await _stations.Find(_ => true).ToListAsync();
        }

        public async Task<Station> GetStationByIdAsync(string id)
        {
            return await _stations.Find(s => s.Id == id).FirstOrDefaultAsync();
        }

        public async Task<Station> CreateStationAsync(Station station)
        {
            await _stations.InsertOneAsync(station);
            return station;
        }

        public async Task<bool> UpdateStationAsync(string id, Station station)
        {
            var result = await _stations.ReplaceOneAsync(s => s.Id == id, station);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteStationAsync(string id)
        {
            var result = await _stations.DeleteOneAsync(s => s.Id == id);
            return result.DeletedCount > 0;
        }
    }
}
