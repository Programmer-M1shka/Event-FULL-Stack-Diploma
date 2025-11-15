using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EventProject.Request
{
    public class CreateTicketDTO
    {
        [Required]
        public int EventId { get; set; }

        [Required]
        //public int OrganizerId { get; set; }


        [StringLength(50)]
        public string Type { get; set; }

        [Required]
        [Range(0.01, double.MaxValue)]
        public decimal Price { get; set; }

        [Required]
        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }
    }
}
