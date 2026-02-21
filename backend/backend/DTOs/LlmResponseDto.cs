namespace backend.DTOs;

public class LlmResponseDto
{
    public string Message { get; set; }

    public LlmResponseDto(string msg)
    {
        Message = msg;
    }
}