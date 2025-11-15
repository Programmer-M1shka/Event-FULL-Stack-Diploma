using EventProject.Models;

namespace EventProject.Services.Abstraction
{
    public interface IJWTService
    {
        UserToken GenerateToken(User user);

    }
}
