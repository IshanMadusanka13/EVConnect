using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;
using webservice.dto;
using webservice.models;
using webservice.services;

namespace webservice.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StationController : ControllerBase
    {
        private readonly StationService _service;

        public StationController(StationService service)
        {
            _service = service;
        }

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
        public async Task<ActionResult<Station>> Create([FromBody] CreateStationRequest station)
        {
            Console.WriteLine("Request for create Station!");
            var created = await _service.CreateStationAsync(station);
            return Ok(created);
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
