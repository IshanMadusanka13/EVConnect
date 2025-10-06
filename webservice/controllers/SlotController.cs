using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using webservice.dto;
using webservice.models;
using webservice.services;

namespace webservice.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SlotController : ControllerBase
    {
        private readonly SlotService _service = new SlotService();

        [HttpGet]
        public async Task<ActionResult<List<Slot>>> GetAll()
        {
            var slots = await _service.GetAllSlotsAsync();
            return Ok(slots);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Slot>> GetById(string id)
        {
            var slot = await _service.GetSlotByIdAsync(id);
            if (slot == null) return NotFound();
            return Ok(slot);
        }

        [HttpGet("station/{stationId}")]
        public async Task<ActionResult<List<Slot>>> GetByStationId(string stationId)
        {
            var slots = await _service.GetSlotsByStationIdAsync(stationId);
            return Ok(slots);
        }

        [HttpGet("operational")]
        public async Task<ActionResult<List<Slot>>> GetOperational()
        {
            var slots = await _service.GetOperationalSlotsAsync();
            return Ok(slots);
        }

        [HttpGet("charger-type/{chargerType}")]
        public async Task<ActionResult<List<Slot>>> GetByChargerType(string chargerType)
        {
            var slots = await _service.GetSlotsByChargerTypeAsync(chargerType);
            return Ok(slots);
        }

        [HttpPost]
        public async Task<ActionResult<List<Slot>>> Create([FromBody] CreateSlotRequest slotRequest)
        {
            var createdSlot = await _service.CreateSlotAsync(slotRequest);
            return CreatedAtAction(nameof(GetById), new { id = createdSlot.Id }, createdSlot);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Slot slot)
        {
            var success = await _service.UpdateSlotAsync(id, slot);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpPatch("{id}/operational-status")]
        public async Task<IActionResult> UpdateOperationalStatus(string id, [FromBody] bool isOperational)
        {
            var success = await _service.UpdateSlotOperationalStatusAsync(id, isOperational);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteSlotAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("station/{stationId}")]
        public async Task<IActionResult> DeleteByStationId(string stationId)
        {
            var success = await _service.DeleteSlotsByStationIdAsync(stationId);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}