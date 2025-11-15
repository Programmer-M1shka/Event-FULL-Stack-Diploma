namespace EventProject.Request
{
    public class EventDTO
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public LocationDTO Location { get; set; }
        public int Capacity { get; set; }
        public UserDTO Organizer { get; set; }
        public string Status { get; set; }

      
    }
}
