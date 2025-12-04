using System.Text;
using System.Text.Json;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ScheduleAnalysisController : ControllerBase
{
    private readonly IScheduleAnalysisService _scheduleAnalysisService;
    private readonly ILogger<ScheduleAnalysisController> _logger;
    private readonly ITaskService _taskService;
    private readonly IUserService _userService;
    private readonly IKeyVaultService _keyVaultService;

    public ScheduleAnalysisController(
        IScheduleAnalysisService scheduleAnalysisService,
        ILogger<ScheduleAnalysisController> logger,
        ITaskService taskService,
        IUserService userService,
        IKeyVaultService keyVaultService)
    {
        _scheduleAnalysisService = scheduleAnalysisService;
        _logger = logger;
        _taskService = taskService;
        _userService = userService;
        _keyVaultService = keyVaultService;
    }

    [HttpGet]
    public async Task<ActionResult<ScheduleAnalysisResponse>> GetScheduleAnalysis()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            var existingAnalysis = await _scheduleAnalysisService.GetLastAnalysisByUserIdAsync(userId.Value);
            if (existingAnalysis != null)
            {
                _logger.LogInformation("Returning existing analysis for user {UserId} from {Timestamp}",
                    userId, existingAnalysis.Timestamp);
                return Ok(existingAnalysis);
            }

            var newAnalysis = await _scheduleAnalysisService.AnalyzeAndSaveUserScheduleAsync(userId.Value);
            return Ok(newAnalysis);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing schedule for user {UserId}", userId);
            return StatusCode(500, new { message = "Error analyzing schedule" });
        }
    }

    [HttpGet("last")]
    public async Task<ActionResult<ScheduleAnalysisResponse>> GetLastAnalysis()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            var analysis = await _scheduleAnalysisService.GetLastAnalysisByUserIdAsync(userId.Value);
            if (analysis == null)
                return NotFound(new { message = "No analysis found for user" });

            return Ok(analysis);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting last analysis for user {UserId}", userId);
            return StatusCode(500, new { message = "Error retrieving analysis" });
        }
    }

    [HttpPost("regenerate")]
    public async Task<ActionResult<ScheduleAnalysisResponse>> RegenerateAnalysis()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            var analysis = await _scheduleAnalysisService.RegenerateAnalysisAsync(userId.Value);
            return Ok(analysis);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error regenerating analysis for user {UserId}", userId);
            return StatusCode(500, new { message = "Error regenerating analysis" });
        }
    }

    [HttpGet("consult")]
    public async Task<ActionResult<string>> GetConsult()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            var tasks = await _taskService.GetUserTasksAsync(userId.Value);
            string tasksContext = string.Empty;
            string url = await _keyVaultService.GetConsultUrlAsync();

            if (tasks != null && tasks.Any())
            {
                tasksContext = "Текущие задачи пользователя:\n" +
                               string.Join("\n", tasks.Select(t => t.ToString()));
            }
            else
            {
                tasksContext = "У пользователя нет активных задач.";
            }

            var user = await _userService.GetUserByIdAsync(userId.Value);
            if (user == null)
            {
                throw new Exception("User not found");
            }

            var group = user.GroupNumber;

            var expressRequest = new
            {
                number = group,
                text = tasksContext
            };

            var jsonContent = JsonSerializer.Serialize(expressRequest);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            _logger.LogInformation("Sending consult request to Express API for user {UserId}, group {Group}",
                userId, group);

            using var httpClient = new HttpClient();
            httpClient.BaseAddress = new Uri(url);
            httpClient.Timeout = TimeSpan.FromSeconds(30);

            HttpResponseMessage response;
            try
            {
                response = await httpClient.PostAsync(
                    "/api/consult",
                    content
                );
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError(ex, "Failed to connect to Express API");
                return StatusCode(503, new
                {
                    success = false,
                    error = "Express API is unavailable",
                    details = "Сервис консультаций временно недоступен"
                });
            }

            return await response.Content.ReadAsStringAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error consulting for user {UserId}", userId);
            return StatusCode(500, new
            {
                success = false,
                message = "Error consulting schedule",
                details = ex.Message
            });
        }
    }

    [HttpDelete]
    public async Task<IActionResult> DeleteAnalysis()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            var deleted = await _scheduleAnalysisService.DeleteAnalysisByUserIdAsync(userId.Value);
            if (!deleted)
                return NotFound(new { message = "No analysis found to delete" });

            return Ok(new { message = "Analysis deleted successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting analysis for user {UserId}", userId);
            return StatusCode(500, new { message = "Error deleting analysis" });
        }
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            return null;

        return userId;
    }
}