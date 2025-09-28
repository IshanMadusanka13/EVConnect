using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using webservice.models;
using webservice.services;

namespace webservice.controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class StationScheduleController : ControllerBase
    {
        private readonly StationScheduleService _service = new StationScheduleService();

        [HttpGet]
        public async Task<ActionResult<List<StationSchedule>>> GetAll()
        {
            var schedules = await _service.GetAllStationSchedulesAsync();
            return Ok(schedules);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<StationSchedule>> GetById(string id)
        {
            var schedule = await _service.GetStationScheduleByIdAsync(id);
            if (schedule == null) return NotFound();
            return Ok(schedule);
        }

        [HttpGet("station/{stationId}")]
        public async Task<ActionResult<List<StationSchedule>>> GetByStationId(string stationId)
        {
            var schedules = await _service.GetSchedulesByStationIdAsync(stationId);
            return Ok(schedules);
        }

        [HttpGet("station/{stationId}/day/{dayOfWeek}")]
        public async Task<ActionResult<StationSchedule>> GetByStationAndDay(string stationId, DayOfWeek dayOfWeek)
        {
            var schedule = await _service.GetScheduleByStationAndDayAsync(stationId, dayOfWeek);
            if (schedule == null) return NotFound();
            return Ok(schedule);
        }

        [HttpGet("day/{dayOfWeek}")]
        public async Task<ActionResult<List<StationSchedule>>> GetByDayOfWeek(DayOfWeek dayOfWeek)
        {
            var schedules = await _service.GetSchedulesByDayOfWeekAsync(dayOfWeek);
            return Ok(schedules);
        }

        [HttpGet("currently-open")]
        public async Task<ActionResult<List<StationSchedule>>> GetCurrentlyOpen()
        {
            var schedules = await _service.GetCurrentlyOpenStationsAsync();
            return Ok(schedules);
        }

        [HttpGet("station/{stationId}/is-open")]
        public async Task<ActionResult<bool>> IsStationOpen(string stationId)
        {
            var currentDay = DateTime.Now.DayOfWeek;
            var currentTime = DateTime.Now.TimeOfDay;
            var isOpen = await _service.IsStationOpenAsync(stationId, currentDay, currentTime);
            return Ok(isOpen);
        }

        [HttpGet("station/{stationId}/is-open/{dayOfWeek}")]
        public async Task<ActionResult<bool>> IsStationOpenOnDay(string stationId, DayOfWeek dayOfWeek, [FromQuery] string time)
        {
            if (!TimeSpan.TryParse(time, out TimeSpan timeSpan))
            {
                return BadRequest("Invalid time format. Use HH:MM:SS format.");
            }

            var isOpen = await _service.IsStationOpenAsync(stationId, dayOfWeek, timeSpan);
            return Ok(isOpen);
        }

        [HttpPost]
        public async Task<ActionResult<StationSchedule>> Create([FromBody] StationSchedule schedule)
        {
            var created = await _service.CreateStationScheduleAsync(schedule);
            return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(string id, [FromBody] StationSchedule schedule)
        {
            var success = await _service.UpdateStationScheduleAsync(id, schedule);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(string id)
        {
            var success = await _service.DeleteStationScheduleAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpDelete("station/{stationId}")]
        public async Task<IActionResult> DeleteByStationId(string stationId)
        {
            var success = await _service.DeleteSchedulesByStationIdAsync(stationId);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}