using System.Security.Claims;
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
public class ChatController : ControllerBase
{
    private readonly IOpenRouterService _openRouterService;
    private readonly ILogger<ChatController> _logger;
    private readonly IBsuirbotService _botService;
    private readonly HttpClient _httpClient;
    private readonly IKeyVaultService _keyVaultService;

    public ChatController(IOpenRouterService openRouterService, ILogger<ChatController> logger,
        IBsuirbotService bsuirBotService, IHttpClientFactory httpClientFactory, IKeyVaultService keyVaultService)
    {
        _openRouterService = openRouterService;
        _logger = logger;
        _botService = bsuirBotService;
        _httpClient = httpClientFactory.CreateClient();
        _keyVaultService = keyVaultService;
        _ = InitializeAsync();
    }

    public async Task InitializeAsync()
    {
        var url = await _keyVaultService.GetBaseUrlAsync();
        _httpClient.BaseAddress = new Uri(url);
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
                error = "Ошибка при вызове BsuirBot API",
                details = ex.Message
            });
        }
    }

    [HttpPost("files")]
    public async Task<ActionResult<LlmResponseDto>> FilesChat([FromBody] ChatRequestDto request)
    {
        string? userId = GetUserId().ToString();
        if (string.IsNullOrEmpty(userId))
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            // создаём объект в snake_case, как ждёт Python
            var pythonRequest = new
            {
                user_id = userId,
                query = request.Request,
                max_files = 10
            };

            var json = JsonSerializer.Serialize(
                pythonRequest,
                new JsonSerializerOptions
                {
                    PropertyNamingPolicy = JsonNamingPolicy.SnakeCaseLower
                });

            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("/teacher/ask", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Python API error: {response.StatusCode} - {errorContent}");

                return StatusCode((int)response.StatusCode, new
                {
                    error = $"Error asking question: {response.ReasonPhrase}",
                    details = errorContent
                });
            }

            var resultJson = await response.Content.ReadAsStringAsync();

            using var doc = JsonDocument.Parse(resultJson);
            var root = doc.RootElement;

            string answer = root.TryGetProperty("teacher_response", out var tr)
                ? tr.GetString()
                : root.TryGetProperty("answer", out var ans)
                    ? ans.GetString()
                    : resultJson;

            return Ok(new LlmResponseDto(answer));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error asking question");
            return StatusCode(500, new { error = ex.Message });
        }
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