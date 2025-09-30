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
        private readonly ILogger<StationService> _logger;

        public StationService(ILogger<StationService> logger)
        {
            _db = new DBConnect();
            _stations = _db.Stations;
            _logger = logger;
        }

        public async Task<List<Station>> GetAllStationsAsync()
        {
            _logger.LogInformation("Fetching all stations");
            try
            {
                var stations = await _stations.Find(_ => true).ToListAsync();
                _logger.LogInformation($"Fetched {stations.Count} stations");
                return stations;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error fetching stations");
                throw;
            }
        }

        public async Task<Station> GetStationByIdAsync(string id)
        {
            _logger.LogInformation($"Fetching station by id: {id}");
            try
            {
                var station = await _stations.Find(s => s.Id == id).FirstOrDefaultAsync();
                if (station == null)
                    _logger.LogWarning($"Station not found: {id}");
                return station;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching station by id: {id}");
                throw;
            }
        }

        public async Task<Station> CreateStationAsync(Station station)
        {
            var lastStation = await _stations
                .Find(s => s.Id != null && s.Id.StartsWith("ST"))
                .SortByDescending(s => s.Id)
                .FirstOrDefaultAsync();

            Console.WriteLine(station.StationName);

            int nextNumber = 1;
            if (lastStation != null && int.TryParse(lastStation.Id.Substring(2), out int lastNumber))
            {
                nextNumber = lastNumber + 1;
            }

            station.Id = $"ST{nextNumber:D3}";
            station.IsActive = true;

            _logger.LogInformation($"Creating station: {station.StationName} ({station.Id})");
            try
            {
                await _stations.InsertOneAsync(station);
                _logger.LogInformation($"Station created: {station.Id}");
                return station;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error creating station: {station.Id}");
                throw;
            }
        }

        public async Task<bool> UpdateStationAsync(string id, Station station)
        {
            _logger.LogInformation($"Updating station: {id}");
            try
            {
                var result = await _stations.ReplaceOneAsync(s => s.Id == id, station);
                bool updated = result.ModifiedCount > 0;
                if (updated)
                    _logger.LogInformation($"Station updated: {id}");
                else
                    _logger.LogWarning($"Station not updated (not found): {id}");
                return updated;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error updating station: {id}");
                throw;
            }
        }

        public async Task<bool> DeleteStationAsync(string id)
        {
            _logger.LogInformation($"Deleting station: {id}");
            try
            {
                var result = await _stations.DeleteOneAsync(s => s.Id == id);
                bool deleted = result.DeletedCount > 0;
                if (deleted)
                    _logger.LogInformation($"Station deleted: {id}");
                else
                    _logger.LogWarning($"Station not deleted (not found): {id}");
                return deleted;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error deleting station: {id}");
                throw;
            }
        }
    }
}
