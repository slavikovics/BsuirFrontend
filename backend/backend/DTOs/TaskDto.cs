namespace backend.DTOs;

public class TaskDto
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string Priority { get; set; } = "medium";
    public bool Completed { get; set; }
    public DateTime CreatedAt { get; set; }
    public string LessonId { get; set; } = string.Empty;
    public string? LessonName { get; set; }
    public string? LessonTime { get; set; }
    public string? LessonDate { get; set; }
}