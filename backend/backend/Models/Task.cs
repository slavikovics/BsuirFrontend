using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace backend.Models;

public class Task
{
    public int Id { get; set; }

    [Required] [MaxLength(200)] public string Title { get; set; } = string.Empty;

    public string? Description { get; set; }

    [Required] [MaxLength(20)] public string Priority { get; set; } = "medium";

    public bool Completed { get; set; } = false;

    [Required] public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public int UserId { get; set; }
    public User User { get; set; } = null!;

    [Required] [MaxLength(100)] public string LessonId { get; set; } = string.Empty;

    [MaxLength(200)] public string? LessonName { get; set; }

    [MaxLength(50)] public string? LessonTime { get; set; }

    [MaxLength(100)] public string? LessonDate { get; set; }
}