namespace EventParkingReservationSystem.API.Interfaces.Services.Email;

public interface IEmailService
{
    Task SendVerificationEmailAsync(
        string email,
        string displayName,
        string verificationToken);

    Task SendPasswordResetEmailAsync(
        string email,
        string displayName,
        string resetToken);
}