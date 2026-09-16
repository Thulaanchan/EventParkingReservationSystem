using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using EventParkingReservationSystem.API.Interfaces.Services.Auth;
using Microsoft.IdentityModel.Tokens;

namespace EventParkingReservationSystem.API.Services.Auth;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string Token, DateTime ExpiresAtUtc) GenerateToken(
        int userId,
        string email,
        string displayName,
        string role,
        bool rememberMe)
    {
        var jwtKey = _configuration["Jwt:Key"]
            ?? throw new InvalidOperationException(
                "JWT signing key is not configured.");

        var issuer = _configuration["Jwt:Issuer"]
            ?? throw new InvalidOperationException(
                "JWT issuer is not configured.");

        var audience = _configuration["Jwt:Audience"]
            ?? throw new InvalidOperationException(
                "JWT audience is not configured.");

        var isAdmin = string.Equals(role, "Admin", StringComparison.OrdinalIgnoreCase) ||
                      string.Equals(role, "Administrator", StringComparison.OrdinalIgnoreCase);

        var adminMinutes = _configuration.GetValue<int>("Jwt:AdminAccessTokenExpirationMinutes");
        if (adminMinutes <= 0) adminMinutes = 15;

        var customerMinutes = _configuration.GetValue<int>("Jwt:CustomerAccessTokenExpirationMinutes");
        if (customerMinutes <= 0) customerMinutes = 30;

        var accessMinutes = isAdmin ? adminMinutes : customerMinutes;

        var nowUtc = DateTime.UtcNow;
        var expiresAtUtc = nowUtc.AddMinutes(accessMinutes);

        var claims = new List<Claim>
        {
            new(
                ClaimTypes.NameIdentifier,
                userId.ToString()),

            new(
                ClaimTypes.Email,
                email),

            new(
                ClaimTypes.Name,
                displayName),

            new(
                ClaimTypes.Role,
                role),

            new(
                JwtRegisteredClaimNames.Jti,
                Guid.NewGuid().ToString())
        };

        var signingKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(jwtKey));

        var credentials = new SigningCredentials(
            signingKey,
            SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            notBefore: nowUtc,
            expires: expiresAtUtc,
            signingCredentials: credentials);

        var tokenValue =
            new JwtSecurityTokenHandler().WriteToken(token);

        return (tokenValue, expiresAtUtc);
    }
}