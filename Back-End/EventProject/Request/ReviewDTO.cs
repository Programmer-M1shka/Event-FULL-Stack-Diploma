using System.ComponentModel.DataAnnotations;

namespace EventProject.Request
{
    public class ReviewDTO
    {
        public int Id { get; set; }

        [Required]
        public int EventId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Range(1, 5)]
        public int Rating { get; set; }

        public string? Comment { get; set; }

        public DateTime? ReviewDate { get; set; }
    }
}
