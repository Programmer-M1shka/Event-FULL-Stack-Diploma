namespace EventProject.Request
{
    public class RegistrationResultDTO
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string EventTitle { get; set; }
        public UserDTO User { get; set; }
        public DateTime RegistrationDate { get; set; }
        public bool Attendance { get; set; }
    }
}
