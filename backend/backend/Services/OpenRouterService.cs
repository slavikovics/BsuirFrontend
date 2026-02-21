using System.Text;
using System.Text.Json;

namespace backend.Services;

public class OpenRouterService : IOpenRouterService
{
    private readonly HttpClient _httpClient;
    private readonly IKeyVaultService _keyVaultService;
    private readonly ILogger<OpenRouterService> _logger;

    public OpenRouterService(
        HttpClient httpClient,
        IKeyVaultService keyVaultService,
        ILogger<OpenRouterService> logger)
    {
        _httpClient = httpClient;
        _keyVaultService = keyVaultService;
        _logger = logger;

        _httpClient.BaseAddress = new Uri("https://openrouter.ai/api/v1/");
    }

    public async Task<string> GetAnalysisAsync(string prompt)
    {
        try
        {
            var apiKey = await _keyVaultService.GetOpenRouterApiKeyAsync();
            var model = await _keyVaultService.GetOpenRouterModelAsync();
            var appUrl = await _keyVaultService.GetOpenRouterAppUrlAsync();

            _httpClient.DefaultRequestHeaders.Clear();
            _httpClient.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");
            _httpClient.DefaultRequestHeaders.Add("HTTP-Referer", appUrl);
            _httpClient.DefaultRequestHeaders.Add("X-Title", "Student Schedule Assistant");

            var requestData = new
            {
                model = model,
                messages = new[]
                {
                    new
                    {
                        role = "user",
                        content = prompt
                    }
                },
                reasoning = new
                {
                    enabled = true
                }
            };

            var json = JsonSerializer.Serialize(requestData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");
            _logger.LogInformation($"Sending request to OpenRouterAPI: {json}");

            var response = await _httpClient.PostAsync("chat/completions", content);
            _logger.LogInformation($"OpenRouter Response: {response}");
            response.EnsureSuccessStatusCode();

            var responseContent = await response.Content.ReadAsStringAsync();
            return responseContent;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error calling OpenRouter API");
            throw new Exception("Failed to get analysis from AI service", ex);
        }
    }
}