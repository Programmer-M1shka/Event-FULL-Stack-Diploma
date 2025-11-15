namespace EventProject.Request
{
    public class MarkAttendanceRequest
    {
        public int ParticipantId { get; set; }
        public bool IsPresent { get; set; }
    }
}
