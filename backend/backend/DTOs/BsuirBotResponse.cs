using System.Text.Json.Serialization;

namespace backend.DTOs;

public class BsuirBotResponse
{
    [JsonPropertyName("response")]
    public string Response { get; set; } = string.Empty;
        
    [JsonPropertyName("source_urls")]
    public string[] SourceUrls { get; set; } = Array.Empty<string>();
}