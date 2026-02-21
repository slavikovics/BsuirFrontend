using backend.DTOs;

namespace backend.Services;

public interface IBsuirbotService
{
    Task<LlmResponseDto> GetApiResponseAsync(string inputString);
}