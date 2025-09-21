using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace webservice.models
{
    public class EVOwner
    {
        public string NIC { get; set; }
        public string FullName { get; set; }
        public string Email { get; set; }
        public string ContactNumber { get; set; }
        public string VehicleNumber { get; set; }
        public string VehicleType { get; set; }
        public string PasswordHash { get; set; }
        public string Address { get; set; }
        public bool IsActive { get; set; }

    }

}
