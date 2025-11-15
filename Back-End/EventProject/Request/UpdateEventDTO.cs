using System.ComponentModel.DataAnnotations;

namespace EventProject.Request
{
    public class UpdateEventDTO
    {
        public string Title { get; set; }
        public string Description { get; set; }
        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int LocationId { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Capacity { get; set; }
        public string Status { get; set; }
    }
}
