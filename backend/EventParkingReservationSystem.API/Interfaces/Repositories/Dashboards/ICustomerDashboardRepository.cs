using EventParkingReservationSystem.API.Models.DTOs.Dashboards;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Dashboards;

public interface ICustomerDashboardRepository
{
    Task<CustomerDashboardSummaryDto> GetSummaryAsync(
        int customerId,
        CancellationToken cancellationToken = default);
}