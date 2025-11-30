using backend.Models;

namespace backend.Services;

public interface ITokenService
{
    Task<string> GenerateJwtToken(User user);
    Task<User?> ValidateJwtToken(string token);
    Task<User?> ValidateAndRefreshTokenAsync(string token);
}