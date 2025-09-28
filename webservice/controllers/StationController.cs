using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using webservice.models;
using webservice.services;

namespace webservice.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StationController : ControllerBase
    {
        private readonly StationService _service = new StationService();

        [HttpGet]
        public async Task<ActionResult<List<Station>>> GetAll()
        {
            var stations = await _service.GetAllStationsAsync();
            return Ok(stations);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Station>> GetById(string id)
        {
            var station = await _service.GetStationByIdAsync(id);
            if (station == null) return NotFound();
            return Ok(station);
        }

        [HttpPost]
        public async Task<ActionResult<Station>> Create([FromBody] Station station)
        {
            var created = await _service.CreateStationAsync(station);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] Station station)
        {
            var success = await _service.UpdateStationAsync(id, station);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteStationAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
