using System.ComponentModel.DataAnnotations.Schema;

namespace EventProject.Request
{
    public class PurchaseDTO
    {
        public int Id { get; set; }
        public int TicketId { get; set; }
        public string TicketType { get; set; }
        public string EventTitle { get; set; }
        public int Quantity { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal TotalAmount { get; set; }
        public DateTime PurchaseDate { get; set; }
        public string Status { get; set; }
    }
}
