using System.ComponentModel.DataAnnotations;

namespace EventProject.Request
{
    public class LocationCreateDTO
    {
        [Required]
        public string Name { get; set; }

        [Required]
        public string Address { get; set; }

        [Required]
        public string City { get; set; }

        [Required]
        public string Country { get; set; }

        public string? ZipCode { get; set; }
    }
}
