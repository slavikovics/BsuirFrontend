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

    public ScheduleAnalysisController(
        IScheduleAnalysisService scheduleAnalysisService,
        ILogger<ScheduleAnalysisController> logger)
    {
        _scheduleAnalysisService = scheduleAnalysisService;
        _logger = logger;
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