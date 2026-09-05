namespace EventParkingReservationSystem.API.Interfaces.Services.Auth;

public interface IJwtTokenService
{
    (string Token, DateTime ExpiresAtUtc) GenerateToken(
        int userId,
        string email,
        string displayName,
        string role,
        bool rememberMe);
}