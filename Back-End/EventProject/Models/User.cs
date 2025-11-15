using EventProject.Enum;
using System.ComponentModel.DataAnnotations;

namespace EventProject.Models
{
    public class User
    {
        [Key]
        public int Id { get; set; }

        [Required]
       
        public string Username { get; set; }

        [Required]
        
        public string Email { get; set; }

        [Required]
       
        public string PasswordHash { get; set; }

        [Required]
        public UserRole Role { get; set; }

        public string FirstName { get; set; }
        public string LastName { get; set; }


        // For Verification
        public bool HasConfirmed { get; set; }
        public string? ConfirmationCode { get; set; }

        // პაროლის აღდგენის ველები
        public string? PasswordResetCode { get; set; }
        public DateTime? PasswordResetCodeExpiry { get; set; }

        public List<Event> OrganizedEvents { get; set; }
        public List<Purchase> Purchases { get; set; }
        public List<Participant> Participations { get; set; }
    }
}
