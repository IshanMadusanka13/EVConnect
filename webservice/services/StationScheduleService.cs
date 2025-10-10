/*
 * StationScheduleService.cs
 * 
 * Service class managing charging station operating schedules.
 * Handles the configuration and querying of station operating hours,
 * including real-time availability checking.
 * 
 * Features:
 * - Operating hours management per day of week
 * - Real-time station availability checking
 * - Schedule queries by station, day, or current time
 * 
 * Dependencies:
 * - MongoDB for data persistence
 */

using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using webservice.data;
using webservice.models;

namespace webservice.services
{
    public class StationScheduleService
    {
        private readonly DBConnect _db;
        private readonly IMongoCollection<StationSchedule> _stationSchedules;

        public StationScheduleService()
        {
            _db = new DBConnect();
            _stationSchedules = _db.StationSchedules;
        }

        public async Task<List<StationSchedule>> GetAllStationSchedulesAsync()
        {
            return await _stationSchedules.Find(_ => true).ToListAsync();
        }

        public async Task<StationSchedule> GetStationScheduleByIdAsync(string id)
        {
            return await _stationSchedules.Find(s => s.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<StationSchedule>> GetSchedulesByStationIdAsync(string stationId)
        {
            return await _stationSchedules.Find(s => s.StationId == stationId).ToListAsync();
        }

        public async Task<StationSchedule> GetScheduleByStationAndDayAsync(string stationId, DayOfWeek dayOfWeek)
        {
            return await _stationSchedules.Find(s => s.StationId == stationId && s.DayOfWeek == dayOfWeek).FirstOrDefaultAsync();
        }

        public async Task<List<StationSchedule>> GetSchedulesByDayOfWeekAsync(DayOfWeek dayOfWeek)
        {
            return await _stationSchedules.Find(s => s.DayOfWeek == dayOfWeek).ToListAsync();
        }

        public async Task<StationSchedule> CreateStationScheduleAsync(StationSchedule schedule)
        {
            await _stationSchedules.InsertOneAsync(schedule);
            return schedule;
        }

        public async Task<bool> UpdateStationScheduleAsync(string id, StationSchedule schedule)
        {
            var result = await _stationSchedules.ReplaceOneAsync(s => s.Id == id, schedule);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteStationScheduleAsync(string id)
        {
            var result = await _stationSchedules.DeleteOneAsync(s => s.Id == id);
            return result.DeletedCount > 0;
        }

        public async Task<bool> DeleteSchedulesByStationIdAsync(string stationId)
        {
            var result = await _stationSchedules.DeleteManyAsync(s => s.StationId == stationId);
            return result.DeletedCount > 0;
        }

        public async Task<bool> IsStationOpenAsync(string stationId, DayOfWeek dayOfWeek, TimeSpan currentTime)
        {
            var schedule = await GetScheduleByStationAndDayAsync(stationId, dayOfWeek);

            if (schedule == null)
                return false;

            return currentTime >= schedule.OpeningTime && currentTime <= schedule.ClosingTime;
        }

        public async Task<List<StationSchedule>> GetCurrentlyOpenStationsAsync()
        {
            var currentDay = DateTime.Now.DayOfWeek;
            var currentTime = DateTime.Now.TimeOfDay;

            return await _stationSchedules
                .Find(s => s.DayOfWeek == currentDay &&
                          s.OpeningTime <= currentTime &&
                          s.ClosingTime >= currentTime)
                .ToListAsync();
        }
    }
}