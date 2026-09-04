namespace EventParkingReservationSystem.API.Models.DTOs.Dashboards;

public sealed class AdminDashboardSummaryDto
{
    public int TotalEvents { get; init; }

    public int TotalBookings { get; init; }

    public int AvailableSeats { get; init; }

    public int OccupiedParking { get; init; }

    public decimal TotalRevenue { get; init; }

    public int TotalCustomers { get; init; }
}