namespace backend.DTOs;

public interface ITaskService
{
    Task<TaskDto> CreateTaskAsync(int userId, CreateTaskRequest request);
    Task<TaskDto?> GetTaskAsync(int taskId, int userId);
    Task<List<TaskDto>> GetUserTasksAsync(int userId);
    Task<List<TaskDto>> GetTasksByLessonAsync(int userId, string lessonId);
    Task<TaskDto?> UpdateTaskAsync(int taskId, int userId, UpdateTaskRequest request);
    Task<bool> DeleteTaskAsync(int taskId, int userId);
    Task<bool> ToggleTaskCompleteAsync(int taskId, int userId);
}