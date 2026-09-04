using EventParkingReservationSystem.API.Interfaces.Repositories.Customers;
using EventParkingReservationSystem.API.Interfaces.Services.Customers;
using EventParkingReservationSystem.API.Models.DTOs.Customers;
using EventParkingReservationSystem.API.Models.Entities.Customers;
using Microsoft.AspNetCore.Identity;

namespace EventParkingReservationSystem.API.Services.Customers;

public class CustomerService : ICustomerService
{
    private readonly ICustomerRepository _customerRepository;
    private readonly IPasswordHasher<Customer> _passwordHasher;

    public CustomerService(
        ICustomerRepository customerRepository,
        IPasswordHasher<Customer> passwordHasher)
    {
        _customerRepository = customerRepository;
        _passwordHasher = passwordHasher;
    }

    public async Task<CustomerResponseDto> RegisterAsync(
        RegisterCustomerDto request)
    {
        var emailExists =
            await _customerRepository.EmailExistsAsync(request.Email);

        if (emailExists)
        {
            throw new InvalidOperationException(
                "A customer with this email already exists.");
        }

        var customer = new Customer
        {
            Name = request.Name,
            Email = request.Email,
            Phone = request.Phone
        };

        customer.PasswordHash =
            _passwordHasher.HashPassword(
                customer,
                request.Password);

        var createdCustomer =
            await _customerRepository.AddAsync(customer);

        return MapToResponse(createdCustomer);
    }

    public async Task<CustomerResponseDto?> GetByIdAsync(
        int customerId)
    {
        var customer =
            await _customerRepository.GetByIdAsync(customerId);

        if (customer is null)
        {
            return null;
        }

        return MapToResponse(customer);
    }

    public async Task<CustomerResponseDto?> UpdateAsync(
        int customerId,
        UpdateCustomerDto request)
    {
        var customer =
            await _customerRepository.GetByIdAsync(customerId);

        if (customer is null)
        {
            return null;
        }

        var existingCustomer =
            await _customerRepository.GetByEmailAsync(request.Email);

        if (existingCustomer is not null &&
            existingCustomer.CustomerId != customerId)
        {
            throw new InvalidOperationException(
                "A customer with this email already exists.");
        }

        customer.Name = request.Name;
        customer.Email = request.Email;
        customer.Phone = request.Phone;

        await _customerRepository.UpdateAsync(customer);

        return MapToResponse(customer);
    }

    private static CustomerResponseDto MapToResponse(
        Customer customer)
    {
        return new CustomerResponseDto
        {
            CustomerId = customer.CustomerId,
            Name = customer.Name,
            Email = customer.Email,
            Phone = customer.Phone
        };
    }
}
