using EventProject.Models;
using EventProject.Request;

namespace EventProject.Services.Abstraction
{
    public interface IUserService
    {
        User AddUser(UserDTO req);
        List<User> GetUsers();
        bool VerifyUser(string email, string code);
        User GetProfile(int id);
        User Login(string email, string password);

        bool ResendVerificationCode(string email);


        // პაროლის აღდგენის მეთოდები
        bool RequestPasswordReset(string email);
        bool VerifyPasswordResetCode(string email, string code);
        bool ResetPassword(string email, string code, string newPassword);


        bool AssignAdminRole(string email);
        bool RemoveAdminRole(string email);
        List<User> GetAdmins();
    }
}
