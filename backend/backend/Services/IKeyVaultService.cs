namespace backend.Services;

public interface IKeyVaultService
{
    Task<string> GetJwtSecretAsync();
    Task<string> GetGoogleClientIdAsync();
    Task<string> GetJwtIssuerAsync();
    Task<string> GetJwtAudienceAsync();
}