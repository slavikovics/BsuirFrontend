using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using backend.DTOs;

namespace backend.Services;

public class BsuirBotService : IBsuirbotService
{
    private readonly HttpClient _httpClient;

    public BsuirBotService()
    {
        var handler = new HttpClientHandler();
        handler.ServerCertificateCustomValidationCallback =
            HttpClientHandler.DangerousAcceptAnyServerCertificateValidator;
        _httpClient = new HttpClient(handler);
    }

    public async Task<LlmResponseDto> GetApiResponseAsync(string inputString)
    {
        try
        {
            var jsonString = JsonSerializer.Serialize(inputString);
            var content = new StringContent(jsonString, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("https://bsuirbot.site/api/", content);
            
            if (!response.IsSuccessStatusCode)
            {
                var errorBody = await response.Content.ReadAsStringAsync();
                response.EnsureSuccessStatusCode();
            }

            var responseBody = await response.Content.ReadAsStringAsync();
            return TransformResponse(responseBody);
        }
        catch (HttpRequestException ex)
        {
            throw new Exception($"Ошибка HTTP запроса: {ex.Message}", ex);
        }
        catch (JsonException ex)
        {
            throw new Exception($"Ошибка парсинга JSON ответа: {ex.Message}", ex);
        }
        catch (Exception ex)
        {
            throw new Exception($"Произошла ошибка: {ex.Message}", ex);
        }
    }

    private LlmResponseDto TransformResponse(string jsonResponse)
    {
        var botResponse = JsonSerializer.Deserialize<BsuirBotResponse>(jsonResponse);

        if (botResponse == null)
        {
            throw new Exception("Не удалось десериализовать ответ от API");
        }

        var fullText = new StringBuilder();
        fullText.AppendLine(botResponse.Response);

        if (botResponse.SourceUrls.Length > 0)
        {
            fullText.AppendLine("\n---\n");
            fullText.AppendLine("**Источники:**");
            fullText.AppendLine();

            for (int i = 0; i < botResponse.SourceUrls.Length; i++)
            {
                fullText.AppendLine($"{i + 1}. [{botResponse.SourceUrls[i]}]({botResponse.SourceUrls[i]})");
            }
        }

        return new LlmResponseDto(fullText.ToString().Trim());
    }
}