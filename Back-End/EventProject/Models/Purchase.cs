using EventProject.Enum;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EventProject.Models
{
    public class Purchase
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public int TicketId { get; set; }

        [Required]
        public int UserId { get; set; }

        [Required]
        public int Quantity { get; set; }

      
        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }

        [Required]
        public DateTime PurchaseDate { get; set; } 

        [Required]
        public PurchaseStatus Status { get; set; }

        public Ticket Ticket { get; set; }
        public User User { get; set; }
    }
}
