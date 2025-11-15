namespace EventProject.Request
{
    public class ParticipantDTO
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public UserDTO User { get; set; }
        public int? TicketId { get; set; }
        public string TicketType { get; set; }
        public DateTime RegistrationDate { get; set; }
        public bool Attendance { get; set; }
    }
}
