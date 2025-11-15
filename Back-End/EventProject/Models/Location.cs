using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace EventProject.Models
{
    public class Location
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
       
        public string Name { get; set; }

        [Required]
        
        public string Address { get; set; }

        
        public string City { get; set; }

       
        public string Country { get; set; }

       
        public string ZipCode { get; set; }
    }
}
