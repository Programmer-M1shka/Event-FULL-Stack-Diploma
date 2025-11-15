using System.ComponentModel.DataAnnotations;

namespace EventProject.Request
{
    public class UserDTO
    {
        public int Id { get; set; }

     
        public string Username { get; set; }
      
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Role { get; set; }




    }
}
