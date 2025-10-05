using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using webservice.data;
using webservice.dto;
using webservice.models;
using webservice.dto;

namespace webservice.services
// ...existing code...
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

        public async Task<Station> CreateStationAsync(CreateStationRequest request)
        {
            _logger.LogInformation("Creating new station");
            try
            {
                var lastStation = await _stations
                    .Find(s => s.Id != null && s.Id.StartsWith("ST"))
                    .SortByDescending(s => s.Id)
                    .FirstOrDefaultAsync();

                int nextNumber = 1;
                if (lastStation != null && int.TryParse(lastStation.Id.Substring(2), out int lastNumber))
                {
                    nextNumber = lastNumber + 1;
                }

                var station = new Station
                {
                    Id = $"ST{nextNumber:D3}",
                    StationName = request.StationName,
                    Address = request.Address,
                    Latitude = request.Latitude,
                    Longitude = request.Longitude,
                    AcChargingRate = request.AcChargingRate,
                    DcChargingRate = request.DcChargingRate,
                    IsActive = true,
                    OperatorId = request.OperatorId
                };

                await _stations.InsertOneAsync(station);
                _logger.LogInformation($"Station created with id: {station.Id}");

                // Create slots for the station
                var slotService = new SlotService();
                int acCount = (int)request.AcCount;
                int dcCount = (int)request.DcCount;
                int slotNumber = 1;
                var slotTasks = new List<Task>();
                for (int i = 0; i < acCount; i++)
                {
                    var slot = new Slot
                    {
                        Id = station.Id + $"-SLOT{slotNumber:D3}",
                        SlotNumber = $"SLOT{slotNumber:D3}",
                        StationId = station.Id,
                        ChargerType = "AC",
                        IsOperational = true
                    };
                    slotTasks.Add(slotService.CreateSlotAsync(slot));
                    slotNumber++;
                }
                for (int i = 0; i < dcCount; i++)
                {
                    var slot = new Slot
                    {
                        Id = station.Id + $"-SLOT{slotNumber:D3}",
                        SlotNumber = $"SLOT{slotNumber:D3}",
                        StationId = station.Id,
                        ChargerType = "DC",
                        IsOperational = true
                    };
                    slotTasks.Add(slotService.CreateSlotAsync(slot));
                    slotNumber++;
                }
                await Task.WhenAll(slotTasks);

                // Add station schedules if provided
                if (request.Schedules != null && request.Schedules.Count > 0)
                {
                    var scheduleService = new StationScheduleService();
                    var scheduleTasks = new List<Task>();
                    foreach (var schedule in request.Schedules)
                    {
                        var stationSchedule = new StationSchedule
                        {
                            Id = Guid.NewGuid().ToString(),
                            StationId = station.Id,
                            DayOfWeek = schedule.DayOfWeek,
                            IsOpen = schedule.IsOpen,
                            OpeningTime = schedule.IsOpen && !string.IsNullOrEmpty(schedule.OpeningTime)
                                ? TimeSpan.Parse(schedule.OpeningTime)
                                : null,
                            ClosingTime = schedule.IsOpen && !string.IsNullOrEmpty(schedule.ClosingTime)
                                ? TimeSpan.Parse(schedule.ClosingTime)
                                : null
                        };
                        scheduleTasks.Add(scheduleService.CreateStationScheduleAsync(stationSchedule));
                    }
                    await Task.WhenAll(scheduleTasks);
                }

                return station;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating station");
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

        public async Task<StationDetailsResponse?> GetStationAllDetailsByIdAsync(string id)
        {
            _logger.LogInformation($"Fetching all details for station id: {id}");
            try
            {
                var station = await GetStationByIdAsync(id);
                if (station == null)
                {
                    _logger.LogWarning($"Station not found: {id}");
                    return new StationDetailsResponse
                    {
                        Station = null,
                        Slots = null,
                        Schedules = null
                    };
                }

                var slotService = new SlotService();
                var slots = (await slotService.GetSlotsByStationIdAsync(id)).OrderBy(s => s.SlotNumber).ToList();

                var scheduleService = new StationScheduleService();
                var schedules = (await scheduleService.GetSchedulesByStationIdAsync(id)).OrderBy(s => s.DayOfWeek).ToList();

                return new StationDetailsResponse
                {
                    Station = station,
                    Slots = slots,
                    Schedules = schedules
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error fetching all details for station id: {id}");
                throw;
            }
        }
    }
}
