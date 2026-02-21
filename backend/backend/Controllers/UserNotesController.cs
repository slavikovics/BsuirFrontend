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
public class UserNotesController : ControllerBase
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<UserNotesController> _logger;
    private readonly IKeyVaultService _keyVaultService;

    public UserNotesController(IHttpClientFactory httpClientFactory, ILogger<UserNotesController> logger, IKeyVaultService keyVaultService)
    {
        _httpClient = httpClientFactory.CreateClient();
        _logger = logger;
        _keyVaultService = keyVaultService;
        _ = InitializeAsync();
    }
    
    public async Task InitializeAsync()
    {
        var url = await _keyVaultService.GetBaseUrlAsync();
        _httpClient.BaseAddress = new Uri(url);
    }

    private string GetUserId()
    {
        return User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
               ?? User?.FindFirst("sub")?.Value
               ?? throw new UnauthorizedAccessException("User ID not found");
    }

    [HttpDelete("files/delete")]
    public async Task<IActionResult> DeleteFile([FromBody] FileDeleteRequest request)
    {
        try
        {
            var userId = GetUserId();

            var json = JsonSerializer.Serialize(new
            {
                user_id = userId,
                file_id = request.FileId
            });
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var requestMessage = new HttpRequestMessage(HttpMethod.Delete, "db/delete")
            {
                Content = content
            };

            var response = await _httpClient.SendAsync(requestMessage);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Error deleting file: {response.StatusCode} - {errorContent}");

                return StatusCode((int)response.StatusCode, new
                {
                    error = $"Error deleting file: {response.ReasonPhrase}",
                    details = errorContent
                });
            }

            var result = await response.Content.ReadAsStringAsync();
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "User not authenticated" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("notes")]
    public async Task<IActionResult> CreateNote([FromBody] NoteCreate noteData)
    {
        try
        {
            var userId = GetUserId();

            var requestData = new
            {
                user_id = userId,
                note_data = noteData
            };

            var json = JsonSerializer.Serialize(requestData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("notes/", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Error creating note: {response.StatusCode} - {errorContent}");

                return StatusCode((int)response.StatusCode, new
                {
                    error = $"Error creating note: {response.ReasonPhrase}",
                    details = errorContent
                });
            }

            var result = await response.Content.ReadAsStringAsync();
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "User not authenticated" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating note");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpGet("notes")]
    public async Task<IActionResult> GetMyNotes([FromQuery] int limit = 100)
    {
        try
        {
            var userId = GetUserId();
            var response = await _httpClient.GetAsync($"notes/?user_id={userId}&limit={limit}");

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Error getting notes: {response.StatusCode} - {errorContent}");

                return StatusCode((int)response.StatusCode, new
                {
                    error = $"Error getting notes: {response.ReasonPhrase}",
                    details = errorContent
                });
            }

            var result = await response.Content.ReadAsStringAsync();
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "User not authenticated" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting notes");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPut("notes/{noteId}")]
    public async Task<IActionResult> UpdateNote(string noteId, [FromBody] NoteUpdate updateData)
    {
        try
        {
            var userId = GetUserId();
            var requestData = new
            {
                user_id = userId,
                update_data = updateData
            };

            var json = JsonSerializer.Serialize(requestData);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PutAsync($"notes/{noteId}", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Error updating note: {response.StatusCode} - {errorContent}");

                return StatusCode((int)response.StatusCode, new
                {
                    error = $"Error updating note: {response.ReasonPhrase}",
                    details = errorContent
                });
            }

            var result = await response.Content.ReadAsStringAsync();
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "User not authenticated" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating note");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpDelete("notes/{noteId}")]
    public async Task<IActionResult> DeleteNote(string noteId)
    {
        try
        {
            var userId = GetUserId();
            var response = await _httpClient.DeleteAsync($"notes/{noteId}?user_id={userId}");

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Error deleting note: {response.StatusCode} - {errorContent}");

                return StatusCode((int)response.StatusCode, new
                {
                    error = $"Error deleting note: {response.ReasonPhrase}",
                    details = errorContent
                });
            }

            var result = await response.Content.ReadAsStringAsync();
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "User not authenticated" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting note");
            return StatusCode(500, new { error = ex.Message });
        }
    }

    [HttpPost("notes/{noteId}/files")]
    public async Task<IActionResult> UploadFileToNote(string noteId, IFormFile file,
        [FromForm] string description = null)
    {
        try
        {
            var userId = GetUserId();
            using var content = new MultipartFormDataContent();

            var fileContent = new StreamContent(file.OpenReadStream());
            fileContent.Headers.ContentType = new MediaTypeHeaderValue(file.ContentType);
            content.Add(fileContent, "file", file.FileName);

            content.Add(new StringContent(userId, Encoding.UTF8), "user_id");

            if (!string.IsNullOrEmpty(description))
            {
                content.Add(new StringContent(description, Encoding.UTF8), "description");
            }

            var response = await _httpClient.PostAsync($"notes/{noteId}/files", content);

            if (!response.IsSuccessStatusCode)
            {
                var errorContent = await response.Content.ReadAsStringAsync();
                _logger.LogError($"Error uploading file: {response.StatusCode} - {errorContent}");

                return StatusCode((int)response.StatusCode, new
                {
                    error = $"Error uploading file: {response.ReasonPhrase}",
                    details = errorContent
                });
            }

            var result = await response.Content.ReadAsStringAsync();
            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Unauthorized(new { error = "User not authenticated" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to note");
            return StatusCode(500, new { error = ex.Message });
        }
    }
}