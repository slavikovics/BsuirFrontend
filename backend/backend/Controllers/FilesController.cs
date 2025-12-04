using System.Net.Http.Headers;
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
public class FilesController : ControllerBase
{
    private readonly IHttpClientFactory _httpClientFactory;
    private readonly ILogger<FilesController> _logger;
    private readonly IKeyVaultService _keyVaultService;
    private string PythonApiBaseUrl;

    public FilesController(
        IHttpClientFactory httpClientFactory,
        ILogger<FilesController> logger,
        IKeyVaultService keyVaultService)
    {
        _httpClientFactory = httpClientFactory;
        _logger = logger;
        _keyVaultService = keyVaultService;
        _ = InitializeAsync();
    }

    private async Task InitializeAsync()
    {
        var url = await _keyVaultService.GetBaseUrlAsync();
        PythonApiBaseUrl = url;
    }

    private string GetUserId()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdClaim))
        {
            userIdClaim = User.FindFirst("user_id")?.Value;
        }

        if (string.IsNullOrEmpty(userIdClaim))
        {
            throw new UnauthorizedAccessException("User ID not found in token");
        }

        return userIdClaim;
    }

    [HttpPost("add")]
    [Consumes("multipart/form-data")]
    public async Task<IActionResult> AddFile([FromForm] IFormFile file, [FromForm] string? metadata = null)
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            if (file == null || file.Length == 0)
                return BadRequest(new { error = "Файл обязателен" });

            using var httpClient = _httpClientFactory.CreateClient();

            // Проксируем заголовок авторизации (если он есть)
            var incomingAuth = Request.Headers["Authorization"].FirstOrDefault();
            if (!string.IsNullOrEmpty(incomingAuth))
            {
                // Используем TryAddWithoutValidation чтобы не парсить вручную "Bearer <token>"
                httpClient.DefaultRequestHeaders.TryAddWithoutValidation("Authorization", incomingAuth);
            }

            using var formContent = new MultipartFormDataContent();

            HttpContent fileContent;
            const long memoryThreshold = 5 * 1024 * 1024; // 5 MB threshold: мелкие файлы — в память, большие — стрим

            if (file.Length <= memoryThreshold)
            {
                // Для небольших файлов можно безопасно буферизовать
                using var ms = new MemoryStream();
                await file.CopyToAsync(ms);
                var bytes = ms.ToArray();
                fileContent = new ByteArrayContent(bytes);
            }
            else
            {
                // Для больших файлов используем StreamContent и НЕ диспоузим исходный поток до выполнения запроса
                // Важно: не ставим using на file.OpenReadStream() — StreamContent сам позаботится при диспоузе formContent/HttpClient
                var stream = file.OpenReadStream();
                fileContent = new StreamContent(stream);
            }

            // Указываем Content-Type (или по умолчанию application/octet-stream)
            var contentType = string.IsNullOrWhiteSpace(file.ContentType)
                ? "application/octet-stream"
                : file.ContentType;
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(contentType);

            // Добавляем файл: имя поля "file", и имя файла — file.FileName
            formContent.Add(fileContent, "file", file.FileName);

            // Доп. поля
            formContent.Add(new StringContent(userId, Encoding.UTF8), "user_id");
            formContent.Add(new StringContent(metadata ?? "{}", Encoding.UTF8, "application/json"), "metadata");

            // Выполняем запрос к Python API
            var pythonUrl = $"{PythonApiBaseUrl.TrimEnd('/')}/db/add?user_id={userId}";
            var response = await httpClient.PostAsync(pythonUrl, formContent);

            var responseText = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                _logger.LogError("Ошибка Python API ({StatusCode}): {Response}", (int)response.StatusCode,
                    responseText);
                // Возвращаем тело ошибки от Python API пользователю с соответствующим статусом
                // Если нужно — можно попытаться распарсить JSON и вернуть как объект
                return StatusCode((int)response.StatusCode, new { error = responseText });
            }

            // Попытаться вернуть содержимое как JSON (если это JSON)
            try
            {
                // Парсим в JsonElement, чтобы ASP.NET корректно сериализовал ответ
                var jsonElement = JsonSerializer.Deserialize<JsonElement>(responseText);
                return Ok(jsonElement);
            }
            catch (JsonException)
            {
                // Если ответ — не JSON, вернём как текст с content-type application/json (всё ещё безопасно)
                return Content(responseText, "application/json");
            }
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "Требуется аутентификация" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при загрузке файла");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("list")]
    public async Task<IActionResult> ListFiles([FromQuery] int limit = 100)
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            using var httpClient = _httpClientFactory.CreateClient();

            var url = $"{PythonApiBaseUrl}/db/list?user_id={Uri.EscapeDataString(userId)}&limit={limit}";
            var response = await httpClient.PostAsync(url, null);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, new { error = errorContent });
            }

            var content = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<object>(content);

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "Требуется аутентификация" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при получении списка файлов");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpDelete("delete")]
    public async Task<IActionResult> DeleteFile([FromBody] FileDeleteRequest request)
    {
        try
        {
            var userId = GetUserId();
            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            if (request.UserId != userId)
            {
                return Forbid();
            }

            using var httpClient = _httpClientFactory.CreateClient();

            var url = $"{PythonApiBaseUrl}/db/delete";

            var jsonContent = JsonSerializer.Serialize(request);
            var content = new StringContent(jsonContent, Encoding.UTF8, "application/json");

            var httpRequest = new HttpRequestMessage(HttpMethod.Delete, url)
            {
                Content = content
            };

            var response = await httpClient.SendAsync(httpRequest);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                return StatusCode((int)response.StatusCode, new { error = errorContent });
            }

            var responseContent = await response.Content.ReadAsStringAsync();
            var result = JsonSerializer.Deserialize<object>(responseContent);

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "Требуется аутентификация" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Ошибка при удалении файла");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}