namespace EventProject.Request
{
    public class AttendanceByEventDTO
    {
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public int Registered { get; set; }
        public int Attended { get; set; }
        public double AttendanceRate { get; set; }
    }
}
