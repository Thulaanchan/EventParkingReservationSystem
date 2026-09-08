using EventParkingReservationSystem.API.Models.DTOs.Dashboards;

namespace EventParkingReservationSystem.API.Interfaces.Services.Dashboards;

public interface ICustomerDashboardService
{
    Task<CustomerDashboardSummaryDto> GetSummaryAsync(
        int customerId,
        CancellationToken cancellationToken = default);
}