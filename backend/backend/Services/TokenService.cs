using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using backend.Data;
using backend.Models;
using Microsoft.IdentityModel.Tokens;

namespace backend.Services;

public class TokenService : ITokenService
{
    private readonly IKeyVaultService _keyVaultService;
    private readonly AppDbContext _context;
    private readonly ILogger<TokenService> _logger;
    private string? _jwtSecret;
    private string? _jwtIssuer;
    private string? _jwtAudience;

    public TokenService(
        IKeyVaultService keyVaultService,
        AppDbContext context,
        ILogger<TokenService> logger)
    {
        _keyVaultService = keyVaultService;
        _context = context;
        _logger = logger;
    }

    public async Task<string> GenerateJwtToken(User user)
    {
        if (_jwtSecret == null)
        {
            _jwtSecret = await _keyVaultService.GetJwtSecretAsync();
            _jwtIssuer = await _keyVaultService.GetJwtIssuerAsync();
            _jwtAudience = await _keyVaultService.GetJwtAudienceAsync();
        }

        var tokenHandler = new JwtSecurityTokenHandler();
        var key = Encoding.ASCII.GetBytes(_jwtSecret);

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity([
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Email, user.Email),
                new Claim("GoogleId", user.GoogleId),
                new Claim(ClaimTypes.Name, user.FullName)
            ]),
            Expires = DateTime.UtcNow.AddDays(7),
            SigningCredentials = new SigningCredentials(
                new SymmetricSecurityKey(key),
                SecurityAlgorithms.HmacSha256Signature),
            Issuer = _jwtIssuer,
            Audience = _jwtAudience
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public async Task<User?> ValidateJwtToken(string token)
    {
        try
        {
            if (_jwtSecret == null)
            {
                _jwtSecret = await _keyVaultService.GetJwtSecretAsync();
                _jwtIssuer = await _keyVaultService.GetJwtIssuerAsync();
                _jwtAudience = await _keyVaultService.GetJwtAudienceAsync();
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);

            var principal = tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidIssuer = _jwtIssuer,
                ValidAudience = _jwtAudience,
                ClockSkew = TimeSpan.Zero
            }, out var validatedToken);

            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userId == null) return null;

            return await _context.Users.FindAsync(int.Parse(userId));
        }
        catch
        {
            return null;
        }
    }

    public async Task<User?> ValidateAndRefreshTokenAsync(string token)
    {
        try
        {
            if (_jwtSecret == null)
            {
                _jwtSecret = await _keyVaultService.GetJwtSecretAsync();
                _jwtIssuer = await _keyVaultService.GetJwtIssuerAsync();
                _jwtAudience = await _keyVaultService.GetJwtAudienceAsync();
            }

            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_jwtSecret);

            // Use more lenient validation for refresh - allow expired tokens within a grace period
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(key),
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidIssuer = _jwtIssuer,
                ValidAudience = _jwtAudience,
                ValidateLifetime = false, // Don't validate lifetime for refresh
                ClockSkew = TimeSpan.FromMinutes(5) // Allow 5 minutes grace period for clock skew
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out var validatedToken);
            
            var userId = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                _logger.LogWarning("Refresh token validation failed: No user ID in token");
                return null;
            }

            // Check if the token is too old to refresh (e.g., more than 30 days)
            var jwtToken = (JwtSecurityToken)validatedToken;
            var tokenIssuedAt = jwtToken.ValidFrom;
            if (DateTime.UtcNow - tokenIssuedAt > TimeSpan.FromDays(30))
            {
                _logger.LogWarning("Refresh token validation failed: Token is too old");
                return null;
            }

            var user = await _context.Users.FindAsync(int.Parse(userId));
            if (user == null)
            {
                _logger.LogWarning("Refresh token validation failed: User not found");
                return null;
            }

            _logger.LogInformation("Token refreshed successfully for user {UserId}", user.Id);
            return user;
        }
        catch (SecurityTokenException ex)
        {
            _logger.LogWarning(ex, "Refresh token validation failed: Security token exception");
            return null;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Refresh token validation failed with unexpected error");
            return null;
        }
    }
}