using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TimetableGrabber___SIT.API
{
    internal class Course
    {
        public string Name { get; set; }
        public string Section { get; set; }
        public string Component { get; set; }
        public DateTime StartDateTime { get; set; }
        public DateTime EndDateTime { get; set; }
        public string Location { get; set; }

        public Course(string name, string section, string component, DateTime startDateTime, DateTime endDateTime, string location)
        {
            Name = name;
            Section = section;
            Component = component;
            StartDateTime = startDateTime;
            EndDateTime = endDateTime;
            Location = location;
        }
    }
}
