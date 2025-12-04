namespace backend.Services;

public interface IKeyVaultService
{
    Task<string> GetJwtSecretAsync();
    Task<string> GetGoogleClientIdAsync();
    Task<string> GetJwtIssuerAsync();
    Task<string> GetJwtAudienceAsync();
    Task<string> GetBaseUrlAsync();
    Task<string> GetConsultUrlAsync();
    
    Task<string> GetOpenRouterApiKeyAsync();
    Task<string> GetOpenRouterModelAsync();
    Task<string> GetOpenRouterAppUrlAsync();
}