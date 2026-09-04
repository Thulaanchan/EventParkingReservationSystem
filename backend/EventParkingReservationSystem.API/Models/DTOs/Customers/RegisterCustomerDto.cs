using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.Models.DTOs.Customers;

public class RegisterCustomerDto
{
    [Required]
    public string Name { get; set; } = string.Empty;

    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    public string Phone { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}