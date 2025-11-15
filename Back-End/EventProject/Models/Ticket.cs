using EventProject.Enum;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EventProject.Models
{
    public class Ticket
    {
        [Key]
        public int Id { get; set; }

        public int EventId { get; set; }

        [StringLength(50)]
        public string Type { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [Required]
        public int Quantity { get; set; }

        [Required]
        public TicketStatus Status { get; set; }

        public Event Event { get; set; }
        public List<Purchase> Purchases { get; set; }
    }
}
