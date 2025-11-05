namespace backend.DTOs;

public class UserDto
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PictureUrl { get; set; } = string.Empty;
    public string? Locale { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}