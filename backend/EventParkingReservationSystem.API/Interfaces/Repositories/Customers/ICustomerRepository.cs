using EventParkingReservationSystem.API.Models.Entities.Customers;

namespace EventParkingReservationSystem.API.Interfaces.Repositories.Customers
{
    public interface ICustomerRepository
    {
        Task<Customer?> GetByIdAsync(int customerId);

        Task<Customer?> GetByEmailAsync(string email);

        Task<bool> EmailExistsAsync(
            string email,
            int? excludeCustomerId = null);

        Task<IReadOnlyList<Customer>> SearchAsync(string? search);

        Task<Customer> AddAsync(Customer customer);

        Task UpdateAsync(Customer customer);
    }
}