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

            var validationTask = GoogleJsonWebSignature.ValidateAsync(token);

            var timeoutTask = Task.Delay(TimeSpan.FromSeconds(5));
            var completedTask = await Task.WhenAny(validationTask, timeoutTask);

            if (completedTask == timeoutTask)
            {
                _logger.LogError("Google token validation timed out after 5 seconds");
                return null;
            }

            var payload = await validationTask;
            return payload;
        }
        catch (InvalidJwtException ex)
        {
            _logger.LogWarning(ex, "Invalid Google token");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Google token validation failed");
            return null;
        }
    }
}