namespace EventParkingReservationSystem.API.Models.DTOs.Customers;

public class CustomerSummaryDto
{
    public int CustomerId { get; set; }

    public string FirstName { get; set; } = string.Empty;

    public string LastName { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public bool IsEmailVerified { get; set; }

    public bool IsActive { get; set; }

    public int BookingCount { get; set; }
}