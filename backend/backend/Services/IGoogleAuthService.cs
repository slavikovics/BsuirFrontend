using Google.Apis.Auth;

namespace backend.Services;

public interface IGoogleAuthService
{
    Task<GoogleJsonWebSignature.Payload?> VerifyGoogleTokenAsync(string token);
}