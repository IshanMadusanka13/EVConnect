using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using webservice.models;
using webservice.services;

namespace webservice.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SlotTypeController : ControllerBase
    {
        private readonly SlotTypeService _service = new SlotTypeService();

        [HttpGet]
        public async Task<ActionResult<List<SlotType>>> GetAll()
        {
            var slotTypes = await _service.GetAllSlotTypesAsync();
            return Ok(slotTypes);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<SlotType>> GetById(string id)
        {
            var slotType = await _service.GetSlotTypeByIdAsync(id);
            if (slotType == null) return NotFound();
            return Ok(slotType);
        }

        [HttpPost]
        public async Task<ActionResult<SlotType>> Create([FromBody] SlotType slotType)
        {
            var createdSlotType = await _service.CreateSlotTypeAsync(slotType);
            return CreatedAtAction(nameof(GetById), new { id = createdSlotType.Id }, createdSlotType);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] SlotType slotType)
        {
            var success = await _service.UpdateSlotTypeAsync(id, slotType);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteSlotTypeAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
