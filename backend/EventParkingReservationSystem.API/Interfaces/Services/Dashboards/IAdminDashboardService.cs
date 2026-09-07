using EventParkingReservationSystem.API.Models.DTOs.Dashboards;

namespace EventParkingReservationSystem.API.Interfaces.Services.Dashboards;

public interface IAdminDashboardService
{
    Task<AdminDashboardSummaryDto> GetSummaryAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<UpcomingEventDto>> GetUpcomingEventsAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<RecentBookingDto>> GetRecentBookingsAsync(
        CancellationToken cancellationToken = default);
}