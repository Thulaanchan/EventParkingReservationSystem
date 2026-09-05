using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.Models.DTOs.Auth;

public class LoginRequestDto
{
    [Required]
    [EmailAddress]
    [MaxLength(150)]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
    public bool RememberMe { get; set; } = false;
}