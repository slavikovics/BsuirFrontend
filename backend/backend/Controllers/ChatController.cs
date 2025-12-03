using System.Security.Claims;
using System.Text.Json;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ChatController : ControllerBase
{
    private readonly IOpenRouterService _openRouterService;
    private readonly ILogger<ChatController> _logger;
    private readonly IBsuirbotService _botService;

    public ChatController(IOpenRouterService openRouterService, ILogger<ChatController> logger, IBsuirbotService bsuirBotService)
    {
        _openRouterService = openRouterService;
        _logger = logger;
        _botService = bsuirBotService;
    }

    [HttpPost("university")]
    public async Task<ActionResult<LlmResponseDto>> UniversityChat([FromBody] ChatRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();
    
        try
        {
            var inputText = request.Request;
            var apiResponse = await _botService.GetApiResponseAsync(inputText);
        
            return Ok(apiResponse);
        }
        catch (Exception ex)
        {
            _logger?.LogError(ex, "Ошибка при вызове BsuirBot API");
        
            return StatusCode(StatusCodes.Status500InternalServerError, new
            {
                error = "Ошибка при обработке запроса",
                details = ex.Message
            });
        }
    }
    
    [HttpPost("files")]
    public async Task<ActionResult> FilesChat([FromBody] ChatRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();
        
        throw new NotImplementedException();
    }

    [HttpPost("llm")]
    public async Task<ActionResult<LlmResponseDto>> LlmChat([FromBody] ChatRequestDto request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized();

        try
        {
            var response = await _openRouterService.GetAnalysisAsync(request.Request);
            return Ok(new LlmResponseDto(ParseLlmResponse(response)));
        }
        catch (Exception e)
        {
            return StatusCode(500, new { message = "Failed to get response" });
        }
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            return null;

        return userId;
    }

    private string ParseLlmResponse(string response)
    {
        var jsonDocument = JsonDocument.Parse(response);
        var root = jsonDocument.RootElement;

        string content;

        if (root.TryGetProperty("choices", out var choices) &&
            choices.GetArrayLength() > 0)
        {
            var firstChoice = choices[0];
            if (firstChoice.TryGetProperty("message", out var message) &&
                message.TryGetProperty("content", out var contentElement))
            {
                content = contentElement.GetString() ?? "";
            }
            else
            {
                throw new Exception("Invalid OpenRouter response structure");
            }
        }
        else
        {
            content = response;
        }

        return content;
    }
}