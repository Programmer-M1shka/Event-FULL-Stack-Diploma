using System.ComponentModel.DataAnnotations;

namespace EventProject.Request
{
    public class UserRoleUpdateDTOcs
    {
        [Required]
        public int UserId { get; set; }
    }
}
