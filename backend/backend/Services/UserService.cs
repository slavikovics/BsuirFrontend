using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class UserService : IUserService
{
    private readonly AppDbContext _context;
    private readonly ILogger<UserService> _logger;

    public UserService(AppDbContext context, ILogger<UserService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<User> CreateOrUpdateUserAsync(string googleId, string email, string fullName, string givenName,
        string surname, string pictureUrl, string? locale)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);

        if (user == null)
        {
            user = new User
            {
                GoogleId = googleId,
                Email = email,
                FullName = fullName,
                FirstName = givenName,
                LastName = surname,
                PictureUrl = pictureUrl,
                Locale = locale ?? "en",
                GroupNumber = null,
                CreatedAt = DateTime.UtcNow,
                LastLogin = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Users.Add(user);
            _logger.LogInformation("Created new user: {Email}", email);
        }
        else
        {
            user.Email = email;
            user.FullName = fullName;
            user.FirstName = givenName;
            user.LastName = surname;
            user.PictureUrl = pictureUrl;
            user.Locale = locale ?? "en";
            user.LastLogin = DateTime.UtcNow;
            user.UpdatedAt = DateTime.UtcNow;

            _context.Users.Update(user);
            _logger.LogInformation("Updated user: {Email}", email);
        }

        await _context.SaveChangesAsync();
        return user;
    }
    
    public async Task<User?> UpdateUserGroupAsync(int userId, int? groupNumber)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null)
        {
            return null;
        }

        if (groupNumber.HasValue)
        {
            if (groupNumber.Value < 100000 || groupNumber.Value > 999999)
            {
                throw new ArgumentException("Group number must be a 6-digit number");
            }
        }

        user.GroupNumber = groupNumber;
        user.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
        
        _logger.LogInformation("Updated group for user {UserId}: {GroupNumber}", userId, groupNumber);
        return user;
    }

    public async Task<User?> GetUserByGoogleIdAsync(string googleId)
    {
        return await _context.Users.FirstOrDefaultAsync(u => u.GoogleId == googleId);
    }

    public async Task<User?> GetUserByIdAsync(int id)
    {
        return await _context.Users.FindAsync(id);
    }
}