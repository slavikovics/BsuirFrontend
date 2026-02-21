using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly IUserService _userService;
    private readonly ILogger<UsersController> _logger;

    public UsersController(IUserService userService, ILogger<UsersController> logger)
    {
        _userService = userService;
        _logger = logger;
    }

    [HttpGet("me")]
    public async Task<ActionResult<UserDto>> GetCurrentUser()
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
        {
            return Unauthorized();
        }

        var user = await _userService.GetUserByIdAsync(int.Parse(userId));
        if (user == null)
        {
            return NotFound(new { message = "User not found" });
        }

        return Ok(new UserDto
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
        });
    }

    [HttpPut("me/group")]
    public async Task<ActionResult<UserDto>> UpdateUserGroup([FromBody] UpdateUserGroupRequest request)
    {
        var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
        if (userId == null)
        {
            return Unauthorized();
        }

        try
        {
            var user = await _userService.UpdateUserGroupAsync(int.Parse(userId), request.GroupNumber);
            if (user == null)
            {
                return NotFound(new { message = "User not found" });
            }

            return Ok(new UserDto
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
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating user group for user {UserId}", userId);
            return StatusCode(500, new { message = "Internal server error" });
        }
    }
}