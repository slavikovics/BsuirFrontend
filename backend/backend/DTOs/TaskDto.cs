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

    public override string ToString()
    {
        var parts = new List<string>
        {
            $"Задача: \"{Title}\"",
            Completed ? "Статус: выполнена" : "Статус: активна",
            $"Приоритет: {Priority}"
        };
    
        if (!string.IsNullOrEmpty(Description))
            parts.Add($"Детали: {Description}");
    
        if (!string.IsNullOrEmpty(LessonName))
        {
            var lessonParts = new List<string> { $"Предмет: {LessonName}" };
            if (!string.IsNullOrEmpty(LessonTime))
                lessonParts.Add($"Время: {LessonTime}");
            if (!string.IsNullOrEmpty(LessonDate))
                lessonParts.Add($"Дата: {LessonDate}");
        
            parts.Add($"Контекст занятия: {string.Join(", ", lessonParts)}");
        }
    
        parts.Add($"Создана: {CreatedAt:dd.MM.yyyy HH:mm}");
    
        return string.Join(". ", parts);
    }
}