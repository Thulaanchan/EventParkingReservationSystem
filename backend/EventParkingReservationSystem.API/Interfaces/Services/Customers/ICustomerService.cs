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

        Task<IReadOnlyList<CustomerSummaryDto>> SearchAsync(
            string? search);

        Task<bool> DeactivateAsync(
            int customerId);
    }
}