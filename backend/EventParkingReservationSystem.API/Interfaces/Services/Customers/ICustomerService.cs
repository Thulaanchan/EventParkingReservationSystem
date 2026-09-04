using EventParkingReservationSystem.API.Models.DTOs.Customers;

namespace EventParkingReservationSystem.API.Interfaces.Services.Customers;

public interface ICustomerService
{
    Task<CustomerResponseDto> RegisterAsync(RegisterCustomerDto request);

    Task<CustomerResponseDto?> GetByIdAsync(int customerId);

    Task<CustomerResponseDto?> UpdateAsync(
        int customerId,
        UpdateCustomerDto request);
}