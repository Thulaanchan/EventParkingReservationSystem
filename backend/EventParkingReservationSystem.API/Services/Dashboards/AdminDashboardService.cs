using EventParkingReservationSystem.API.Interfaces.Repositories.Dashboards;
using EventParkingReservationSystem.API.Interfaces.Services.Dashboards;
using EventParkingReservationSystem.API.Models.DTOs.Dashboards;

namespace EventParkingReservationSystem.API.Services.Dashboards;

public sealed class AdminDashboardService(
    IAdminDashboardRepository repository)
    : IAdminDashboardService
{
    private readonly IAdminDashboardRepository _repository =
        repository;

    public Task<AdminDashboardSummaryDto> GetSummaryAsync(
        CancellationToken cancellationToken = default)
    {
        return _repository.GetSummaryAsync(
            cancellationToken);
    }

    public Task<IReadOnlyList<UpcomingEventDto>>
        GetUpcomingEventsAsync(
            CancellationToken cancellationToken = default)
    {
        return _repository.GetUpcomingEventsAsync(
            5,
            cancellationToken);
    }

    public Task<IReadOnlyList<RecentBookingDto>>
        GetRecentBookingsAsync(
            CancellationToken cancellationToken = default)
    {
        return _repository.GetRecentBookingsAsync(
            5,
            cancellationToken);
    }
}