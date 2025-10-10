/*
 * SlotType.cs
 * 
 * Model class representing a type of charging slot.
 * Defines the characteristics of a charging slot including its name
 * and charging rate (cost per unit of energy).
 * 
 * Used to configure different types of charging slots (e.g., AC, DC, Super)
 * with their respective pricing.
 */

using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace webservice.models
{
    public class SlotType
    {
    public string? Id { get; set; }
    public string SlotName { get; set; }
    public decimal Rate { get; set; }

    }

}
