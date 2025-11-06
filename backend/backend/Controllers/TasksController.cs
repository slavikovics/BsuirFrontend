using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TasksController : ControllerBase
{
    private readonly ITaskService _taskService;
    private readonly ILogger<TasksController> _logger;

    public TasksController(ITaskService taskService, ILogger<TasksController> logger)
    {
        _taskService = taskService;
        _logger = logger;
    }

    [HttpGet]
    public async Task<ActionResult<List<TaskDto>>> GetUserTasks()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var tasks = await _taskService.GetUserTasksAsync(userId.Value);
        return Ok(tasks);
    }

    [HttpGet("lesson/{lessonId}")]
    public async Task<ActionResult<List<TaskDto>>> GetTasksByLesson(string lessonId)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var tasks = await _taskService.GetTasksByLessonAsync(userId.Value, lessonId);
        return Ok(tasks);
    }

    [HttpPost]
    public async Task<ActionResult<TaskDto>> CreateTask(CreateTaskRequest request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            var task = await _taskService.CreateTaskAsync(userId.Value, request);
            return CreatedAtAction(nameof(GetTask), new { id = task.Id }, task);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating task for user {UserId}", userId);
            return StatusCode(500, new { message = "Error creating task" });
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TaskDto>> GetTask(int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var task = await _taskService.GetTaskAsync(id, userId.Value);
        if (task == null)
            return NotFound(new { message = "Task not found" });

        return Ok(task);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<TaskDto>> UpdateTask(int id, UpdateTaskRequest request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var task = await _taskService.UpdateTaskAsync(id, userId.Value, request);
        if (task == null)
            return NotFound(new { message = "Task not found" });

        return Ok(task);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteTask(int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var result = await _taskService.DeleteTaskAsync(id, userId.Value);
        if (!result)
            return NotFound(new { message = "Task not found" });

        return NoContent();
    }

    [HttpPatch("{id}/toggle-complete")]
    public async Task<ActionResult<TaskDto>> ToggleTaskComplete(int id)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        var result = await _taskService.ToggleTaskCompleteAsync(id, userId.Value);
        if (!result)
            return NotFound(new { message = "Task not found" });
        
        var task = await _taskService.GetTaskAsync(id, userId.Value);
        return Ok(task);
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            return null;

        return userId;
    }
}