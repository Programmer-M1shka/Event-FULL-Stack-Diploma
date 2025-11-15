namespace EventProject.Request
{
    public class TicketDTO
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public string Type { get; set; }
        public decimal Price { get; set; }
        public int Quantity { get; set; }
        public string Status { get; set; }
    }
}
