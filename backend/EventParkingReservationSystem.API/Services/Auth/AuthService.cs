using System.Security.Cryptography;
using System.Text;
using EventParkingReservationSystem.API.Interfaces.Repositories.Customers;
using EventParkingReservationSystem.API.Interfaces.Services.Auth;
using EventParkingReservationSystem.API.Interfaces.Services.Customers;
using EventParkingReservationSystem.API.Interfaces.Services.Email;
using EventParkingReservationSystem.API.Models.DTOs.Auth;
using EventParkingReservationSystem.API.Models.DTOs.Customers;
using EventParkingReservationSystem.API.Models.Entities.Customers;
using Microsoft.AspNetCore.Identity;
using EventParkingReservationSystem.API.Common.Constants;

namespace EventParkingReservationSystem.API.Services.Auth;

public class AuthService : IAuthService
{
    

    private readonly ICustomerService _customerService;
    private readonly ICustomerRepository _customerRepository;
    private readonly IPasswordHasher<Customer> _passwordHasher;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IEmailService _emailService;
    private readonly IConfiguration _configuration;

    public AuthService(
        ICustomerService customerService,
        ICustomerRepository customerRepository,
        IPasswordHasher<Customer> passwordHasher,
        IJwtTokenService jwtTokenService,
        IEmailService emailService,
        IConfiguration configuration)
    {
        _customerService = customerService;
        _customerRepository = customerRepository;
        _passwordHasher = passwordHasher;
        _jwtTokenService = jwtTokenService;
        _emailService = emailService;
        _configuration = configuration;
    }

    public async Task<CustomerDto> RegisterAsync(
        RegisterCustomerRequestDto request)
    {
        var customerDto =
            await _customerService.RegisterAsync(request);

        var customer =
            await _customerRepository.GetByEmailAsync(
                NormalizeEmail(customerDto.Email));

        if (customer is null)
        {
            throw new InvalidOperationException(
                "The customer account could not be loaded after registration.");
        }

        var verificationToken = GenerateSecureToken();

        customer.EmailVerificationTokenHash =
            HashToken(verificationToken);

        customer.EmailVerificationTokenExpiresAt =
            DateTime.UtcNow.AddHours(
                GetEmailVerificationExpiryHours());

        customer.UpdatedAt = DateTime.UtcNow;

        await _customerRepository.UpdateAsync(customer);

        await _emailService.SendVerificationEmailAsync(
            customer.Email,
            GetDisplayName(customer),
            verificationToken);

        return customerDto;
    }

    public async Task<AuthResponseDto> LoginAsync(
        LoginRequestDto request)
    {
        var normalizedEmail =
            NormalizeEmail(request.Email);

        var customer =
            await _customerRepository.GetByEmailAsync(
                normalizedEmail);

        if (customer is null)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        var passwordResult =
            _passwordHasher.VerifyHashedPassword(
                customer,
                customer.PasswordHash,
                request.Password);

        if (passwordResult ==
            PasswordVerificationResult.Failed)
        {
            throw new UnauthorizedAccessException(
                "Invalid email or password.");
        }

        if (!customer.IsActive)
        {
            throw new InvalidOperationException(
                "This account has been deactivated.");
        }

        if (!customer.IsEmailVerified)
        {
            throw new InvalidOperationException(
                "Please verify your email before signing in.");
        }

        var tokenResult =
            _jwtTokenService.GenerateToken(
                customer.CustomerId,
                customer.Email,
                GetDisplayName(customer),
                AppRoles.Customer,
                request.RememberMe);

        return new AuthResponseDto
        {
            Token = tokenResult.Token,
            ExpiresAt = tokenResult.ExpiresAtUtc,
            UserId = customer.CustomerId,
            DisplayName = GetDisplayName(customer),
            Email = customer.Email,
            Role = AppRoles.Customer
        };
    }

    public async Task<bool> VerifyEmailAsync(
        VerifyEmailRequestDto request)
    {
        var customer =
            await _customerRepository.GetByEmailAsync(
                NormalizeEmail(request.Email));

        if (customer is null)
        {
            return false;
        }

        if (customer.IsEmailVerified)
        {
            return true;
        }

        if (string.IsNullOrWhiteSpace(
                customer.EmailVerificationTokenHash) ||
            customer.EmailVerificationTokenExpiresAt is null)
        {
            return false;
        }

        if (customer.EmailVerificationTokenExpiresAt
            <= DateTime.UtcNow)
        {
            return false;
        }

        if (!TokenMatches(
                request.Token,
                customer.EmailVerificationTokenHash))
        {
            return false;
        }

        customer.IsEmailVerified = true;

        customer.EmailVerificationTokenHash = null;
        customer.EmailVerificationTokenExpiresAt = null;

        customer.UpdatedAt = DateTime.UtcNow;

        await _customerRepository.UpdateAsync(customer);

        return true;
    }

    public async Task ResendVerificationEmailAsync(
        ResendVerificationRequestDto request)
    {
        var customer =
            await _customerRepository.GetByEmailAsync(
                NormalizeEmail(request.Email));

        /*
         * Do not reveal whether the account exists.
         */
        if (customer is null ||
            customer.IsEmailVerified ||
            !customer.IsActive)
        {
            return;
        }

        var verificationToken =
            GenerateSecureToken();

        customer.EmailVerificationTokenHash =
            HashToken(verificationToken);

        customer.EmailVerificationTokenExpiresAt =
            DateTime.UtcNow.AddHours(
                GetEmailVerificationExpiryHours());

        customer.UpdatedAt = DateTime.UtcNow;

        await _customerRepository.UpdateAsync(customer);

        await _emailService.SendVerificationEmailAsync(
            customer.Email,
            GetDisplayName(customer),
            verificationToken);
    }

    public async Task ForgotPasswordAsync(
        ForgotPasswordRequestDto request)
    {
        var customer =
            await _customerRepository.GetByEmailAsync(
                NormalizeEmail(request.Email));

        /*
         * Always allow the controller to return a generic response.
         * This avoids revealing registered email addresses.
         */
        if (customer is null || !customer.IsActive)
        {
            return;
        }

        var resetToken =
            GenerateSecureToken();

        customer.PasswordResetTokenHash =
            HashToken(resetToken);

        customer.PasswordResetTokenExpiresAt =
            DateTime.UtcNow.AddMinutes(
                GetPasswordResetExpiryMinutes());

        customer.UpdatedAt = DateTime.UtcNow;

        await _customerRepository.UpdateAsync(customer);

        await _emailService.SendPasswordResetEmailAsync(
            customer.Email,
            GetDisplayName(customer),
            resetToken);
    }

    public async Task<bool> ResetPasswordAsync(
        ResetPasswordRequestDto request)
    {
        var customer =
            await _customerRepository.GetByEmailAsync(
                NormalizeEmail(request.Email));

        if (customer is null ||
            !customer.IsActive)
        {
            return false;
        }

        if (string.IsNullOrWhiteSpace(
                customer.PasswordResetTokenHash) ||
            customer.PasswordResetTokenExpiresAt is null)
        {
            return false;
        }

        if (customer.PasswordResetTokenExpiresAt
            <= DateTime.UtcNow)
        {
            return false;
        }

        if (!TokenMatches(
                request.Token,
                customer.PasswordResetTokenHash))
        {
            return false;
        }

        customer.PasswordHash =
            _passwordHasher.HashPassword(
                customer,
                request.NewPassword);

        /*
         * Reset tokens are single-use.
         */
        customer.PasswordResetTokenHash = null;
        customer.PasswordResetTokenExpiresAt = null;

        customer.UpdatedAt = DateTime.UtcNow;

        await _customerRepository.UpdateAsync(customer);

        return true;
    }

    private static string NormalizeEmail(
        string email)
    {
        return email
            .Trim()
            .ToLowerInvariant();
    }

    private static string GetDisplayName(
        Customer customer)
    {
        return $"{customer.FirstName} {customer.LastName}"
            .Trim();
    }

    private static string GenerateSecureToken()
    {
        var tokenBytes =
            RandomNumberGenerator.GetBytes(32);

        return Convert.ToBase64String(tokenBytes);
    }

    private static string HashToken(
        string token)
    {
        var tokenBytes =
            Encoding.UTF8.GetBytes(token);

        var hashBytes =
            SHA256.HashData(tokenBytes);

        return Convert.ToHexString(hashBytes);
    }

    private static bool TokenMatches(
        string providedToken,
        string storedTokenHash)
    {
        var providedHash =
            HashToken(providedToken);

        var providedBytes =
            Encoding.UTF8.GetBytes(providedHash);

        var storedBytes =
            Encoding.UTF8.GetBytes(storedTokenHash);

        if (providedBytes.Length != storedBytes.Length)
        {
            return false;
        }

        return CryptographicOperations.FixedTimeEquals(
            providedBytes,
            storedBytes);
    }

    private int GetEmailVerificationExpiryHours()
    {
        var hours =
            _configuration.GetValue<int>(
                "Auth:EmailVerificationExpiryHours");

        return hours > 0
            ? hours
            : 24;
    }

    private int GetPasswordResetExpiryMinutes()
    {
        var minutes =
            _configuration.GetValue<int>(
                "Auth:PasswordResetExpiryMinutes");

        return minutes > 0
            ? minutes
            : 60;
    }
}