// Services/EnvironmentKeyVaultService.cs
namespace backend.Services;

public class EnvironmentKeyVaultService : IKeyVaultService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EnvironmentKeyVaultService> _logger;

    public EnvironmentKeyVaultService(IConfiguration configuration, ILogger<EnvironmentKeyVaultService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public Task<string> GetJwtSecretAsync()
    {
        return GetSecretAsync("JWT_SECRET", "Jwt:Secret");
    }

    public Task<string> GetGoogleClientIdAsync()
    {
        return GetSecretAsync("GOOGLE_CLIENT_ID", "Authentication:Google:ClientId");
    }

    public Task<string> GetJwtIssuerAsync()
    {
        return GetSecretAsync("JWT_ISSUER", "Jwt:Issuer", "backend-app");
    }

    public Task<string> GetJwtAudienceAsync()
    {
        return GetSecretAsync("JWT_AUDIENCE", "Jwt:Audience", "react-app");
    }

    public Task<string> GetBaseUrlAsync()
    {
        return GetSecretAsync("RAG_BASE_URL", "Rag:Url", "http://host.docker.internal:8500");
    }

    public Task<string> GetOpenRouterApiKeyAsync()
    {
        return GetSecretAsync("OPENROUTER_API_KEY", "OpenRouter:ApiKey");
    }

    public Task<string> GetOpenRouterModelAsync()
    {
        return GetSecretAsync("OPENROUTER_MODEL", "OpenRouter:Model", "anthropic/claude-3-sonnet");
    }

    public Task<string> GetOpenRouterAppUrlAsync()
    {
        return GetSecretAsync("OPENROUTER_APP_URL", "OpenRouter:AppUrl", "https://student-schedule-app.com");
    }

    private Task<string> GetSecretAsync(string envVarName, string configPath, string? defaultValue = null)
    {
        var value = Environment.GetEnvironmentVariable(envVarName) 
                    ?? _configuration[configPath] 
                    ?? defaultValue;

        if (string.IsNullOrEmpty(value))
        {
            throw new InvalidOperationException($"Secret {envVarName} not found in environment or configuration");
        }

        return Task.FromResult(value);
    }
}