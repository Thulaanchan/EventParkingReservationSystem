namespace EventParkingReservationSystem.API.Models.DTOs.Dashboards;

public class CustomerDashboardSummaryDto
{
    public int UpcomingBookingsCount { get; set; }

    public int ReservedParkingCount { get; set; }

    public int RecentPaymentsCount { get; set; }

    public int UnreadNotificationsCount { get; set; }
}