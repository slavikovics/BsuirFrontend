using System.Security.Claims;
using System.Text;
using System.Text.Json;
using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/test")]
[Authorize]
public class TestController : ControllerBase
{
    private readonly ILogger<TestController> _logger;
    private readonly HttpClient _httpClient;
    private readonly IKeyVaultService _keyVaultService;

    public TestController(ILogger<TestController> logger, IHttpClientFactory httpClientFactory, IKeyVaultService keyVaultService)
    {
        _logger = logger;
        _httpClient = httpClientFactory.CreateClient();
        _keyVaultService = keyVaultService;
        _ = InitializeAsync();
    }

    private async Task InitializeAsync()
    {
        var url = await _keyVaultService.GetBaseUrlAsync();
        _httpClient.BaseAddress = new Uri(url);
    }

    private int? GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
        if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out var userId))
            return null;

        return userId;
    }

    [HttpPost("generate-and-get")]
    public async Task<IActionResult> GenerateAndGetTests([FromBody] GenerateRequest request)
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            var generateRequest = new
            {
                user_id = userId.Value.ToString(),
                query = request.Query,
                max_files = 10,
                force_recreate = false
            };

            var json = JsonSerializer.Serialize(generateRequest);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var generateResponse = await _httpClient.PostAsync("/generate-tests", content);
            if (!generateResponse.IsSuccessStatusCode)
            {
                var errorContent = await generateResponse.Content.ReadAsStringAsync();
                return StatusCode((int)generateResponse.StatusCode, errorContent);
            }

            var testResponse = await _httpClient.GetAsync($"/test-json?user_id={userId.Value}");
            var testJson = await testResponse.Content.ReadAsStringAsync();

            if (!testResponse.IsSuccessStatusCode)
            {
                return StatusCode((int)testResponse.StatusCode, testJson);
            }

            return Content(testJson, "application/json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка вызова generate-and-get");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("result")]
    public async Task<IActionResult> ReceiveResult()
    {
        var userId = GetUserId();
        if (userId == null)
            return Unauthorized(new { error = "User not authenticated" });

        try
        {
            using var reader = new StreamReader(Request.Body);
            var body = await reader.ReadToEndAsync();

            var response = await _httpClient.PostAsync($"/result?user_id={userId.Value}",
                new StringContent(body, Encoding.UTF8, "application/json"));
            var result = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
                return StatusCode((int)response.StatusCode, result);

            return Content(result, "application/json");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка вызова /result");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}