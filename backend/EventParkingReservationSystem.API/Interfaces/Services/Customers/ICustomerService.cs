using EventParkingReservationSystem.API.Common.Pagination;
using EventParkingReservationSystem.API.Models.DTOs.Customers;

namespace EventParkingReservationSystem.API.Interfaces.Services.Customers
{
    public interface ICustomerService
    {
        Task<CustomerDto> RegisterAsync(
            RegisterCustomerRequestDto request);

        Task<CustomerDto?> GetByIdAsync(
            int customerId);

        Task<CustomerDto?> UpdateAsync(
            int customerId,
            UpdateCustomerRequestDto request);

        Task<PagedResult<CustomerSummaryDto>> SearchAsync(
            string? search,
            int page,
            int pageSize);

        Task<bool> DeactivateAsync(
            int customerId);
    }
}