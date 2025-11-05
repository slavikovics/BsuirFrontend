namespace backend.Models;

public class AuthResponse
{
    public string Token { get; set; } = string.Empty;
    public User User { get; set; } = null!;
    public DateTime ExpiresAt { get; set; }
}