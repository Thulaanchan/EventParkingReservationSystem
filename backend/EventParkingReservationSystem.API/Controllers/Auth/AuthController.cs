using EventParkingReservationSystem.API.Interfaces.Services.Auth;
using EventParkingReservationSystem.API.Models.DTOs.Auth;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Auth;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login(
        [FromBody] LoginRequestDto request)
    {
        try
        {
            var result =
                await _authService.LoginAsync(request);

            return Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return StatusCode(
                StatusCodes.Status403Forbidden,
                new
                {
                    message = ex.Message
                });
        }
    }

    [AllowAnonymous]
    [HttpPost("verify-email")]
    public async Task<IActionResult> VerifyEmail(
        [FromBody] VerifyEmailRequestDto request)
    {
        var success =
            await _authService.VerifyEmailAsync(request);

        if (!success)
        {
            return BadRequest(new
            {
                message =
                    "The email verification link is invalid or has expired."
            });
        }

        return Ok(new
        {
            message =
                "Email verified successfully. You can now sign in."
        });
    }

    [AllowAnonymous]
    [HttpPost("resend-verification")]
    public async Task<IActionResult> ResendVerification(
        [FromBody] ResendVerificationRequestDto request)
    {
        await _authService
            .ResendVerificationEmailAsync(request);

        return Ok(new
        {
            message =
                "If an unverified account exists for this email, a verification email has been sent."
        });
    }

    [AllowAnonymous]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword(
        [FromBody] ForgotPasswordRequestDto request)
    {
        await _authService
            .ForgotPasswordAsync(request);

        return Ok(new
        {
            message =
                "If an account exists for this email, a password reset link has been sent."
        });
    }

    [AllowAnonymous]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword(
        [FromBody] ResetPasswordRequestDto request)
    {
        var success =
            await _authService.ResetPasswordAsync(request);

        if (!success)
        {
            return BadRequest(new
            {
                message =
                    "The password reset link is invalid or has expired."
            });
        }

        return Ok(new
        {
            message =
                "Your password has been reset successfully."
        });
    }
}