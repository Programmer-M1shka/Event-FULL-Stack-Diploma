using System.ComponentModel.DataAnnotations;

namespace EventProject.Models
{
    public class Participant
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int EventId { get; set; }

        [Required]
        public int UserId { get; set; }

        public int? TicketId { get; set; }

        [Required]
        public DateTime RegistrationDate { get; set; }

        public bool Attendance { get; set; }
        

        public Event Event { get; set; }
        public User User { get; set; }
        public Ticket Ticket { get; set; }
    }
}
