using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using MongoDB.Driver;
using webservice.data;
using webservice.dto;
using webservice.models;

namespace webservice.services
{
    public class SlotService
    {
        private readonly DBConnect _db;
        private readonly IMongoCollection<Slot> _slots;

        public SlotService()
        {
            _db = new DBConnect();
            _slots = _db.Slots;
        }

        public async Task<List<Slot>> GetAllSlotsAsync()
        {
            return await _slots.Find(_ => true).ToListAsync();
        }

        public async Task<Slot> GetSlotByIdAsync(string id)
        {
            return await _slots.Find(s => s.Id == id).FirstOrDefaultAsync();
        }

        public async Task<List<Slot>> GetSlotsByStationIdAsync(string stationId)
        {
            return await _slots.Find(s => s.StationId == stationId).ToListAsync();
        }

        public async Task<List<Slot>> GetOperationalSlotsAsync()
        {
            return await _slots.Find(s => s.IsOperational == true).ToListAsync();
        }

        public async Task<List<Slot>> GetSlotsByChargerTypeAsync(string chargerType)
        {
            return await _slots.Find(s => s.ChargerType == chargerType).ToListAsync();
        }

        public async Task<Slot> CreateSlotAsync(Slot slot)
        {
            await _slots.InsertOneAsync(slot);
            return slot;
        }

        public async Task<bool> UpdateSlotAsync(string id, Slot slot)
        {
            var result = await _slots.ReplaceOneAsync(s => s.Id == id, slot);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteSlotAsync(string id)
        {
            var result = await _slots.DeleteOneAsync(s => s.Id == id);
            return result.DeletedCount > 0;
        }

        public async Task<bool> UpdateSlotOperationalStatusAsync(string id, bool isOperational)
        {
            var update = Builders<Slot>.Update.Set(s => s.IsOperational, isOperational);
            var result = await _slots.UpdateOneAsync(s => s.Id == id, update);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteSlotsByStationIdAsync(string stationId)
        {
            var result = await _slots.DeleteManyAsync(s => s.StationId == stationId);
            return result.DeletedCount > 0;
        }
    }
}