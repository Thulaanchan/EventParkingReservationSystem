using EventParkingReservationSystem.API.Models.DTOs.Auth;
using EventParkingReservationSystem.API.Models.DTOs.Customers;

namespace EventParkingReservationSystem.API.Interfaces.Services.Auth;

public interface IAuthService
{
    Task<CustomerDto> RegisterAsync(
        RegisterCustomerRequestDto request);

    Task<AuthResponseDto> LoginAsync(
        LoginRequestDto request);

    Task<bool> VerifyEmailAsync(
        VerifyEmailRequestDto request);

    Task ResendVerificationEmailAsync(
        ResendVerificationRequestDto request);

    Task ForgotPasswordAsync(
        ForgotPasswordRequestDto request);

    Task<bool> ResetPasswordAsync(
        ResetPasswordRequestDto request);

    Task<AuthResponseDto> RefreshTokenAsync(
        RefreshTokenRequestDto request,
        string? ipAddress = null);

    Task<bool> RevokeRefreshTokenAsync(
        LogoutRequestDto request,
        string? ipAddress = null);
}