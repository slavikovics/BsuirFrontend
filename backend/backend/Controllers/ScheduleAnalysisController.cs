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

    public ScheduleAnalysisController(IScheduleAnalysisService scheduleAnalysisService, ILogger<ScheduleAnalysisController> logger)
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
            var analysis = await _scheduleAnalysisService.AnalyzeUserScheduleAsync(userId.Value);
            return Ok(analysis);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error analyzing schedule for user {UserId}", userId);
            return StatusCode(500, new { message = "Error analyzing schedule" });
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