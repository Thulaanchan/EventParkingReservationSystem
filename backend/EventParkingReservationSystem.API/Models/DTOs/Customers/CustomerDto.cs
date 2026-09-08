namespace EventParkingReservationSystem.API.Models.DTOs.Customers;

public class CustomerDto
{
    public int CustomerId { get; set; }

    public string FirstName { get; set; }
        = string.Empty;

    public string LastName { get; set; }
        = string.Empty;

    public string Email { get; set; }
        = string.Empty;

    public string? Phone { get; set; }

    public bool IsActive { get; set; }

    public bool IsEmailVerified { get; set; }

    // Number of bookings created by this customer.
    public int BookingCount { get; set; }

    public DateTime CreatedAt { get; set; }

    public DateTime? UpdatedAt { get; set; }
}