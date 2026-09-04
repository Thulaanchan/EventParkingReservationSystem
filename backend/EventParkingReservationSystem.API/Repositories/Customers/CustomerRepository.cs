using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Interfaces.Repositories.Customers;
using EventParkingReservationSystem.API.Models.Entities.Customers;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Repositories.Customers;

public class CustomerRepository : ICustomerRepository
{
    private readonly ApplicationDbContext _context;

    public CustomerRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<Customer?> GetByIdAsync(int customerId)
    {
        return await _context.Customers
            .FirstOrDefaultAsync(c => c.CustomerId == customerId);
    }

    public async Task<Customer?> GetByEmailAsync(string email)
    {
        return await _context.Customers
            .FirstOrDefaultAsync(c => c.Email == email);
    }

    public async Task<bool> EmailExistsAsync(string email)
    {
        return await _context.Customers
            .AnyAsync(c => c.Email == email);
    }

    public async Task<Customer> AddAsync(Customer customer)
    {
        await _context.Customers.AddAsync(customer);
        await _context.SaveChangesAsync();

        return customer;
    }

    public async Task UpdateAsync(Customer customer)
    {
        _context.Customers.Update(customer);
        await _context.SaveChangesAsync();
    }
}