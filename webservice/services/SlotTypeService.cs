/*
 * SlotTypeService.cs
 * 
 * Service class managing different types of charging slots.
 * Handles the configuration and management of charging slot types,
 * including their pricing and characteristics.
 * 
 * Features:
 * - Automatic ID generation for new slot types
 * - CRUD operations for slot type configurations
 * - Rate management for different charger types
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
    public class SlotTypeService
    {
        private readonly DBConnect _db;
        private readonly IMongoCollection<SlotType> _slotTypes;

        public SlotTypeService()
        {
            _db = new DBConnect();
            _slotTypes = _db.SlotTypes;
        }

        private async Task<string> GetNextIdAsync()
        {
            var last = await _slotTypes.Find(_ => true)
                .SortByDescending(st => st.Id)
                .FirstOrDefaultAsync();
            int nextId = last != null && int.TryParse(last.Id, out int id) ? id + 1 : 1;
            return nextId.ToString();
        }

        public async Task<List<SlotType>> GetAllSlotTypesAsync()
        {
            return await _slotTypes.Find(_ => true).ToListAsync();
        }

        public async Task<SlotType> GetSlotTypeByIdAsync(string id)
        {
            return await _slotTypes.Find(st => st.Id == id).FirstOrDefaultAsync();
        }

        public async Task<SlotType> CreateSlotTypeAsync(SlotType slotType)
        {
            slotType.Id = await GetNextIdAsync();
            await _slotTypes.InsertOneAsync(slotType);
            return slotType;
        }

        public async Task<bool> UpdateSlotTypeAsync(string id, SlotType slotType)
        {
            slotType.Id = id;
            var result = await _slotTypes.ReplaceOneAsync(st => st.Id == id, slotType);
            return result.ModifiedCount > 0;
        }

        public async Task<bool> DeleteSlotTypeAsync(string id)
        {
            var result = await _slotTypes.DeleteOneAsync(st => st.Id == id);
            return result.DeletedCount > 0;
        }
    }
}
