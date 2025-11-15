using System.ComponentModel.DataAnnotations;

namespace EventProject.Request
{
    public class CreatePurchaseDTO
    {
        public int EventId { get; set; }           // აირჩია ივენთი
        public string TicketType { get; set; }     // აირჩია ტიპი
        public int Quantity { get; set; }
        public string PromoCode { get; set; }
        public int UserId { get; set; }
    }
}
