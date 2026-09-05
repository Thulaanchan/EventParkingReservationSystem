using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.Models.DTOs.Auth;

public class ResendVerificationRequestDto
{
    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;
}