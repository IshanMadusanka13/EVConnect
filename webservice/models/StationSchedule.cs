/*
 * StationSchedule.cs
 * 
 * Model class representing the operating schedule of a charging station.
 * Defines the opening and closing times for each day of the week,
 * allowing stations to set and manage their operating hours.
 * 
 * Relationships:
 * - Station (via StationId)
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace webservice.models
{
public class StationSchedule
{
    public string? Id { get; set; }
    public string? StationId { get; set; }
    public DayOfWeek DayOfWeek { get; set; }
    public bool IsOpen { get; set; }
    public TimeSpan? OpeningTime { get; set; }
    public TimeSpan? ClosingTime { get; set; }
}

}
