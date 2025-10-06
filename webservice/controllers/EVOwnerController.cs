using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using webservice.models;
using webservice.services;
using webservice.dto;

namespace webservice.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EVOwnerController : ControllerBase
    {
        private readonly EVOwnerService _service;

        public EVOwnerController(EVOwnerService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<ActionResult<List<EVOwner>>> GetAll()
        {
            var evOwners = await _service.GetAllEVOwnersAsync();
            return Ok(evOwners);
        }

        [HttpGet("{nic}")]
        public async Task<ActionResult<EVOwner>> GetByNIC(string nic)
        {
            var evOwner = await _service.GetEVOwnerByNICAsync(nic);
            if(evOwner == null) return NotFound(new {message = "EV Owner not found"});
            return Ok(evOwner);
        }

        [HttpPost]
        public async Task<ActionResult> Create([FromBody] EVOwner evOwner)
        {
            var result = await _service.CreateEVOwnerAsync(evOwner);

            if(!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return CreatedAtAction(nameof(GetByNIC),
                new { nic = evOwner.NIC},
                new
                {
                    message = result.Message,
                    evOwner = evOwner
                }
            );
        }

//        [HttpPut("{nic}")]
//        public async Task<ActionResult> Update(string nic, [FromBody] EVOwner evOwner)
//        {
//            var result = await _service.UpdateEVOwnerAsync(nic, evOwner);
//
//            if(!result.Success)
//            {
//                return BadRequest(new { message = result.Message });
//            }
//
//            return Ok(new { message = result.Message });
//        }

        [HttpPut("{nic}")]
        public async Task<ActionResult> Update(string nic, [FromBody] UpdateEVOwnerRequest updateRequest)
        {
            try
            {
                // Get existing owner
                var existingOwner = await _service.GetEVOwnerByNICAsync(nic);
                if (existingOwner == null)
                    return NotFound(new { message = "EV Owner not found" });

                // Update only the provided fields
                if (!string.IsNullOrEmpty(updateRequest.FirstName))
                    existingOwner.FirstName = updateRequest.FirstName;

                if (!string.IsNullOrEmpty(updateRequest.LastName))
                    existingOwner.LastName = updateRequest.LastName;

                if (updateRequest.DateOfBirth != default(DateTime))
                    existingOwner.DateOfBirth = updateRequest.DateOfBirth;

                if (!string.IsNullOrEmpty(updateRequest.Gender))
                    existingOwner.Gender = updateRequest.Gender;

                if (!string.IsNullOrEmpty(updateRequest.Email))
                    existingOwner.Email = updateRequest.Email;

                if (!string.IsNullOrEmpty(updateRequest.PhoneNumber))
                    existingOwner.PhoneNumber = updateRequest.PhoneNumber;

                if (!string.IsNullOrEmpty(updateRequest.Address))
                    existingOwner.Address = updateRequest.Address;

                if (!string.IsNullOrEmpty(updateRequest.VehicleType))
                    existingOwner.VehicleType = updateRequest.VehicleType;

                if (!string.IsNullOrEmpty(updateRequest.VehicleModel))
                    existingOwner.VehicleModel = updateRequest.VehicleModel;

                if (!string.IsNullOrEmpty(updateRequest.VehiclePlateNumber))
                    existingOwner.VehiclePlateNumber = updateRequest.VehiclePlateNumber;

                if (!string.IsNullOrEmpty(updateRequest.BatteryCapacity))
                    existingOwner.BatteryCapacity = updateRequest.BatteryCapacity;

                if (!string.IsNullOrEmpty(updateRequest.CompatibleChargerTypes))
                    existingOwner.CompatibleChargerTypes = updateRequest.CompatibleChargerTypes;

                var result = await _service.UpdateEVOwnerAsync(nic, existingOwner);

                if (!result.Success)
                    return BadRequest(new { message = result.Message });

                return Ok(new { message = result.Message });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = $"Error updating EV owner: {ex.Message}" });
            }
        }

        [HttpDelete("{nic}")]
        public async Task<ActionResult> Delete(string nic)
        {
            var result = await _service.DeleteEVOwnerAsync(nic);

            if(!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message });
        }

        [HttpPatch("{nic}/activate")]
         public async Task<ActionResult> Activate(string nic)
         {
            var result = await _service.ActivateEVOwnerAsync(nic);

            if (!result.Success)
            {
                return BadRequest(new { message = result.Message });
            }

            return Ok(new { message = result.Message });
         }

         [HttpPatch("{nic}/deactivate")]
         public async Task<ActionResult> Deactivate(string nic)
         {
             var result = await _service.DeactivateEVOwnerAsync(nic);

             if (!result.Success)
             {
                 return BadRequest(new { message = result.Message });
             }

             return Ok(new { message = result.Message });
         }

         [HttpGet("active")]
         public async Task<ActionResult<List<EVOwner>>> GetActive()
         {
            var activeOwners = await _service.GetActiveEVOwnersAsync();
            return Ok(activeOwners);
         }

         [HttpGet("inactive")]
         public async Task<ActionResult<List<EVOwner>>> GetInactive()
         {
             var inactiveOwners = await _service.GetInactiveEVOwnersAsync();
             return Ok(inactiveOwners);
         }

         [HttpGet("search")]
         public async Task<ActionResult<List<EVOwner>>> Search([FromQuery] string searchTerm)
         {
            var evOwners = await _service.SearchEVOwnersAsync(searchTerm);
            return Ok(evOwners);
         }

    }
}
