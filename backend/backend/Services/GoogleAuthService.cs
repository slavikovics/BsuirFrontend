using Google.Apis.Auth;

namespace backend.Services;

public class GoogleAuthService : IGoogleAuthService
{
    private readonly IKeyVaultService _keyVaultService;
    private readonly ILogger<GoogleAuthService> _logger;
    private string? _googleClientId;

    public GoogleAuthService(
        IKeyVaultService keyVaultService,
        ILogger<GoogleAuthService> logger)
    {
        _keyVaultService = keyVaultService;
        _logger = logger;
    }

    public async Task<GoogleJsonWebSignature.Payload?> VerifyGoogleTokenAsync(string token)
    {
        try
        {
            if (_googleClientId == null)
            {
                _googleClientId = await _keyVaultService.GetGoogleClientIdAsync();
            }

            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                Audience = new[] { _googleClientId }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(token, settings);
            return payload;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Google token validation failed");
            return null;
        }
    }
}