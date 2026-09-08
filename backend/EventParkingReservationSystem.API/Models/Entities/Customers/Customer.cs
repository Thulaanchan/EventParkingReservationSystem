using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.Models.Entities.Customers;

public class Customer
{
    public int CustomerId { get; set; }

    [Required]
    [MaxLength(50)]
    public string FirstName { get; set; }
        = string.Empty;

    [Required]
    [MaxLength(50)]
    public string LastName { get; set; }
        = string.Empty;

    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; }
        = string.Empty;

    [MaxLength(25)]
    public string? Phone { get; set; }

    [Required]
    public string PasswordHash { get; set; }
        = string.Empty;

    public bool IsActive { get; set; }
        = true;

    public bool IsEmailVerified { get; set; }
        = false;

    public string? EmailVerificationTokenHash { get; set; }

    public DateTime? EmailVerificationTokenExpiresAt { get; set; }

    public string? PasswordResetTokenHash { get; set; }

    public DateTime? PasswordResetTokenExpiresAt { get; set; }

    public DateTime CreatedAt { get; set; }
        = DateTime.UtcNow;

    public DateTime? UpdatedAt { get; set; }
}