using EventProject.Enum;
using System.ComponentModel.DataAnnotations;
using System.Net.Sockets;

namespace EventProject.Models
{
    public class Event
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(100)]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

     
        public int LocationId { get; set; }          
        public Location Location { get; set; }       

        [Required]
        public int OrganizerId { get; set; }        
        public User Organizer { get; set; }

        [Required]
        public int Capacity { get; set; }



        [Required]
        public EventStatus Status { get; set; }

        public List<Ticket> Tickets { get; set; }
        public List<Participant> Participants { get; set; }
    }
}
