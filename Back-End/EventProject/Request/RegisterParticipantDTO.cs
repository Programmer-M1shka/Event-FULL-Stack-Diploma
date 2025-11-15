using System.ComponentModel.DataAnnotations;

namespace EventProject.Request
{
    public class RegisterParticipantDTO
    {
        [Required]
        public int EventId { get; set; }
        
        public int? TicketId { get; set; }

        [Required]
        public int UserId { get; set; }
      
    }
}
