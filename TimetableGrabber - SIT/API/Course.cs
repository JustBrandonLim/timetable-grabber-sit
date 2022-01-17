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
        public string Date { get; set; }
        public string StartTime { get; set; }
        public string EndTime { get; set; }
        public string Location { get; set; }

        public Course(string name, string date, string startTime, string endTime, string location)
        {
            Name = name;
            Date = date;
            StartTime = startTime;
            EndTime = endTime;
            Location = location;
        }
    }
}
