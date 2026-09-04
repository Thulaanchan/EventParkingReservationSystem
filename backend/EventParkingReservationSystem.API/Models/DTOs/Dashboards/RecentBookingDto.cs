namespace EventParkingReservationSystem.API.Models.DTOs.Dashboards;

public sealed class RecentBookingDto
{
    public int BookingId { get; init; }

    public string BookingNumber { get; init; } = string.Empty;

    public string CustomerName { get; init; } = string.Empty;

    public string EventName { get; init; } = string.Empty;

    public DateTime CreatedAt { get; init; }

    public decimal Amount { get; init; }

    public string Status { get; init; } = string.Empty;
}