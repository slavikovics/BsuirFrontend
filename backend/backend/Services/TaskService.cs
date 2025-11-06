using backend.Data;
using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class TaskService : ITaskService
{
    private readonly AppDbContext _context;
    private readonly ILogger<TaskService> _logger;

    public TaskService(AppDbContext context, ILogger<TaskService> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<TaskDto> CreateTaskAsync(int userId, CreateTaskRequest request)
    {
        var task = new Models.Task
        {
            Title = request.Title,
            Description = request.Description,
            Priority = request.Priority,
            UserId = userId,
            LessonId = request.LessonId,
            LessonName = request.LessonName,
            LessonTime = request.LessonTime,
            LessonDate = request.LessonDate,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Tasks.Add(task);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Created task {TaskId} for user {UserId}", task.Id, userId);

        return MapToDto(task);
    }

    public async Task<TaskDto?> GetTaskAsync(int taskId, int userId)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

        return task != null ? MapToDto(task) : null;
    }

    public async Task<List<TaskDto>> GetUserTasksAsync(int userId)
    {
        var tasks = await _context.Tasks
            .Where(t => t.UserId == userId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => MapToDto(t))
            .ToListAsync();

        return tasks;
    }

    public async Task<List<TaskDto>> GetTasksByLessonAsync(int userId, string lessonId)
    {
        var tasks = await _context.Tasks
            .Where(t => t.UserId == userId && t.LessonId == lessonId)
            .OrderByDescending(t => t.CreatedAt)
            .Select(t => MapToDto(t))
            .ToListAsync();

        return tasks;
    }

    public async Task<TaskDto?> UpdateTaskAsync(int taskId, int userId, UpdateTaskRequest request)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

        if (task == null)
            return null;

        if (!string.IsNullOrEmpty(request.Title))
            task.Title = request.Title;

        if (request.Description != null)
            task.Description = request.Description;

        if (!string.IsNullOrEmpty(request.Priority))
            task.Priority = request.Priority;

        if (request.Completed.HasValue)
            task.Completed = request.Completed.Value;

        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Updated task {TaskId} for user {UserId}", taskId, userId);

        return MapToDto(task);
    }

    public async Task<bool> DeleteTaskAsync(int taskId, int userId)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

        if (task == null)
            return false;

        _context.Tasks.Remove(task);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted task {TaskId} for user {UserId}", taskId, userId);

        return true;
    }

    public async Task<bool> ToggleTaskCompleteAsync(int taskId, int userId)
    {
        var task = await _context.Tasks
            .FirstOrDefaultAsync(t => t.Id == taskId && t.UserId == userId);

        if (task == null)
            return false;

        task.Completed = !task.Completed;
        task.UpdatedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();

        _logger.LogInformation("Toggled task {TaskId} completion to {Completed} for user {UserId}", 
            taskId, task.Completed, userId);

        return true;
    }

    private static TaskDto MapToDto(Models.Task task)
    {
        return new TaskDto
        {
            Id = task.Id,
            Title = task.Title,
            Description = task.Description,
            Priority = task.Priority,
            Completed = task.Completed,
            CreatedAt = task.CreatedAt,
            LessonId = task.LessonId,
            LessonName = task.LessonName,
            LessonTime = task.LessonTime,
            LessonDate = task.LessonDate
        };
    }
}