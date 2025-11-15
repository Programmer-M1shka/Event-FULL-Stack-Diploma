namespace EventProject.Request
{
    public class CampaignROIDTO
    {
        public string CampaignId { get; set; }
        public decimal Cost { get; set; }
        public decimal Revenue { get; set; }
        public double ROI { get; set; }
    }
}
