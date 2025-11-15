using System.ComponentModel.DataAnnotations;

namespace EventProject.Request
{
    public class CreateEventDTO
    {
       
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

            //[Required]
            //public int Capacity { get; set; }

            [Required]
            public int OrganizerId { get; set; }
        }
    }

