using EventParkingReservationSystem.API.Models.DTOs.Dashboards;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Dashboards;

public interface IAdminDashboardRepository
{
    Task<AdminDashboardSummaryDto> GetSummaryAsync(
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<UpcomingEventDto>> GetUpcomingEventsAsync(
        int take = 5,
        CancellationToken cancellationToken = default);

    Task<IReadOnlyList<RecentBookingDto>> GetRecentBookingsAsync(
        int take = 5,
        CancellationToken cancellationToken = default);
}