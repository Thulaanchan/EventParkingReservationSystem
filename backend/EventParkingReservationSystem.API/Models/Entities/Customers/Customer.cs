namespace EventParkingReservationSystem.API.Models.Entities.Customers;

public class Customer
{
    public int CustomerId { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Phone { get; set; } = string.Empty;

    public string PasswordHash { get; set; } = string.Empty;
}