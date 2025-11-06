using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IGoogleAuthService _googleAuthService;
    private readonly IUserService _userService;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        IGoogleAuthService googleAuthService,
        IUserService userService,
        ITokenService tokenService,
        ILogger<AuthController> logger)
    {
        _googleAuthService = googleAuthService;
        _userService = userService;
        _tokenService = tokenService;
        _logger = logger;
    }

    [HttpPost("google")]
    public async Task<ActionResult<AuthResponseDto>> GoogleAuth([FromBody] GoogleAuthRequest request)
    {
        try
        {
            var payload = await _googleAuthService.VerifyGoogleTokenAsync(request.Token);
            if (payload == null)
            {
                return BadRequest(new { message = "Invalid Google token" });
            }

            var user = await _userService.CreateOrUpdateUserAsync(
                payload.Subject,
                payload.Email,
                payload.Name,
                payload.GivenName,
                payload.FamilyName,
                payload.Picture,
                payload.Locale
            );

            var token = await _tokenService.GenerateJwtToken(user);
            var expiresAt = DateTime.UtcNow.AddDays(7);

            var response = new AuthResponseDto
            {
                Token = token,
                User = new UserDto
                {
                    Id = user.Id,
                    Email = user.Email,
                    FullName = user.FullName,
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    PictureUrl = user.PictureUrl,
                    Locale = user.Locale,
                    GroupNumber = user.GroupNumber,
                    CreatedAt = user.CreatedAt
                },
                ExpiresAt = expiresAt
            };

            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during Google authentication");
            return StatusCode(500, new { message = "Internal server error" });
        }
    }

    [HttpPost("logout")]
    public IActionResult Logout()
    {
        return Ok(new { message = "Logged out successfully" });
    }
}
