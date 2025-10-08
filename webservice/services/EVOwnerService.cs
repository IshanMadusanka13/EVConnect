using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using MongoDB.Driver;
using webservice.data;
using webservice.models;

namespace webservice.services
{
    public class EVOwnerService
    {
        private readonly IMongoCollection<EVOwner> _evOwners;

        public EVOwnerService(DBConnect db)
        {
            _evOwners = db.EVOwners;
        }

        // GetAllEVOwners
        public async Task<List<EVOwner>> GetAllEVOwnersAsync()
        {
            return await _evOwners.Find(_ => true).ToListAsync();
        }

        // GetEVOwnerByNIC
        public async Task<EVOwner> GetEVOwnerByNICAsync(string nic)
        {
            return await _evOwners.Find(owner => owner.NIC == nic).FirstOrDefaultAsync();
        }

        // CreateEVOwner
        public async Task<(bool Success, string Message)> CreateEVOwnerAsync(EVOwner evOwner)
        {
            try
            {
                // Check if EV owner with same NIC already exists
                var existingOwner = await GetEVOwnerByNICAsync(evOwner.NIC);
                if(existingOwner != null)
                {
                    return(false, "EV Owner with this NIC already exists");
                }

                //validate required fields
                if(string.IsNullOrEmpty(evOwner.NIC) || string.IsNullOrEmpty(evOwner.FirstName)
                || string.IsNullOrEmpty(evOwner.LastName) || string.IsNullOrEmpty(evOwner.Email))
                {
                    return(false, "NIC, FirstName, LastName, Email are required fields");
                }

                //set default values for new registrations
                evOwner.RegistrationDate = DateTime.Now;
                evOwner.IsActive = true; //New Accounts are active by default

                await _evOwners.InsertOneAsync(evOwner);
                return(true, "EV Owner created Successfully");
            }
            catch(Exception ex)
            {
                return(false, $"Error creating EV Owner: {ex.Message}");
            }
        }

        // UpdateEVOwner
        public async Task<(bool Success, string Message)> UpdateEVOwnerAsync(string nic, EVOwner evOwner)
        {
            try
            {
                // Check if EV owner exists
                var existingOwner = await GetEVOwnerByNICAsync(nic);
                if(existingOwner == null)
                {
                    return(false, "EV Owner not found");
                }

                //Ensure NIC Cannot be changed
                if(evOwner.NIC != nic)
                {
                    return(false, "NIC cannot be modified");
                }

                //validate required fields
                if (string.IsNullOrEmpty(evOwner.FirstName) || string.IsNullOrEmpty(evOwner.LastName)
                || string.IsNullOrEmpty(evOwner.Email))
                {
                    return (false, "FirstName, LastName, and Email are required fields");
                }

                // Preserve registration date and active status from existing record
                evOwner.RegistrationDate = existingOwner.RegistrationDate;
                evOwner.IsActive = existingOwner.IsActive;

                var result = await _evOwners.ReplaceOneAsync(owner => owner.NIC == nic, evOwner);
                return(result.ModifiedCount > 0, result.ModifiedCount > 0 ?
                "EV Owner Updated Successfully" : "Failed to Update EV Owner");
            }
            catch(Exception ex)
            {
                return(false, $"Error updating EV owner: {ex.Message}");
            }
        }

        // DeleteEVOwner
        public async Task<(bool Success, string Message)> DeleteEVOwnerAsync(string nic)
        {
            try
            {
                // Check if EV owner exists
                var existingOwner = await GetEVOwnerByNICAsync(nic);
                if(existingOwner == null)
                {
                    return(false, "EV Owner not found");
                }

                var result = await _evOwners.DeleteOneAsync(owner => owner.NIC == nic);
                return(result.DeletedCount > 0, result.DeletedCount > 0 ?
                "EV Owner Deleted Successfully" : "Failed to delete EV Owner");
            }
            catch(Exception ex)
            {
                return(false, $"Error deleting EV Owner: {ex.Message}");
            }
        }

        // ActivateEVOwner
        public async Task<(bool Success, string Message)> ActivateEVOwnerAsync(string nic)
        {
            try
            {
                var update = Builders<EVOwner>.Update.Set(owner => owner.IsActive, true);

                var result = await _evOwners.UpdateOneAsync(owner => owner.NIC == nic, update);
                return(result.ModifiedCount > 0, result.ModifiedCount > 0
                ? "EV Owner Activated Successfully" : "EV Owner not found or already active");
            }
            catch(Exception ex)
            {
                return(false, $"Error activating EV Owner: {ex.Message}");
            }
        }

        // DeactivateEVOwner
        public async Task<(bool Success, string Message)> DeactivateEVOwnerAsync(string nic)
        {
            try
            {
                var update = Builders<EVOwner>.Update.Set(owner => owner.IsActive, false);

                var result = await _evOwners.UpdateOneAsync(owner => owner.NIC == nic, update);
                return(result.ModifiedCount > 0, result.ModifiedCount > 0
                ? "EV Owner Deactivated Successfully" : "EV Owner not found or already inactive");
            }
            catch(Exception ex)
            {
                return(false, $"Error deactivating EV Owner: {ex.Message}");
            }
        }

        // GetActiveEVOwners
        public async Task<List<EVOwner>> GetActiveEVOwnersAsync()
        {
            return await _evOwners.Find(owner => owner.IsActive == true).ToListAsync();
        }

        // GetInactiveEVOwners
        public async Task<List<EVOwner>> GetInactiveEVOwnersAsync()
        {
            return await _evOwners.Find(owner => owner.IsActive == false).ToListAsync();
        }

        //SearchEVOwners
        public async Task<List<EVOwner>> SearchEVOwnersAsync(string searchTerm)
        {
            if(string.IsNullOrEmpty(searchTerm))
            {
                return await GetAllEVOwnersAsync();
            }

            var filter = Builders<EVOwner>.Filter.Or(
                Builders<EVOwner>.Filter.Where(owner => owner.FirstName.Contains(searchTerm)),
                Builders<EVOwner>.Filter.Where(owner => owner.LastName.Contains(searchTerm)),
                Builders<EVOwner>.Filter.Where(owner => owner.Email.Contains(searchTerm))
            );

            return await _evOwners.Find(filter).ToListAsync();
        }


    }
}