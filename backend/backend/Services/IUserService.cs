using backend.Models;

namespace backend.Services;

public interface IUserService
{
    Task<User> CreateOrUpdateUserAsync(string googleId, string email, string fullName, string givenName, string surname,
        string pictureUrl, string locale);

    Task<User?> GetUserByGoogleIdAsync(string googleId);
    
    Task<User?> GetUserByIdAsync(int id);
    
    Task<User?> UpdateUserGroupAsync(int userId, int? groupNumber);
}