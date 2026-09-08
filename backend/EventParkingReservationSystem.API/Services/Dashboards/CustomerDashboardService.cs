using EventParkingReservationSystem.API.Interfaces.Repositories.Dashboards;
using EventParkingReservationSystem.API.Interfaces.Services.Dashboards;
using EventParkingReservationSystem.API.Models.DTOs.Dashboards;

namespace EventParkingReservationSystem.API.Services.Dashboards;

public sealed class CustomerDashboardService
    : ICustomerDashboardService
{
    private readonly ICustomerDashboardRepository
        _customerDashboardRepository;

    public CustomerDashboardService(
        ICustomerDashboardRepository customerDashboardRepository)
    {
        _customerDashboardRepository =
            customerDashboardRepository;
    }

    public async Task<CustomerDashboardSummaryDto> GetSummaryAsync(
        int customerId,
        CancellationToken cancellationToken = default)
    {
        if (customerId <= 0)
        {
            throw new ArgumentException(
                "A valid customer is required.",
                nameof(customerId));
        }

        return await _customerDashboardRepository
            .GetSummaryAsync(
                customerId,
                cancellationToken);
    }
}