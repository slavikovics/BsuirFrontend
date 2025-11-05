using System.ComponentModel.DataAnnotations;
using System.Runtime.CompilerServices;

namespace backend.Models;

public class User
{
    [Key]
    public int Id { get; set; }
        
    [Required]
    public string GoogleId { get; set; } = string.Empty;
        
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;
        
    public string FullName { get; set; } = string.Empty;
    public string FirstName { get; set; } = string.Empty;
    public string LastName { get; set; } = string.Empty;
    public string PictureUrl { get; set; } = string.Empty;
    public string? Locale { get; set; } = string.Empty;
        
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime LastLogin { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
    public bool IsActive { get; set; } = true;
}