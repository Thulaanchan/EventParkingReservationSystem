using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using EventParkingReservationSystem.API.Interfaces.Repositories.Customers;
using EventParkingReservationSystem.API.Interfaces.Services.Customers;
using EventParkingReservationSystem.API.Models.DTOs.Customers;
using EventParkingReservationSystem.API.Models.Entities.Customers;
using EventParkingReservationSystem.API.Common.Pagination;
using EventParkingReservationSystem.API.Interfaces.Repositories.Bookings;

namespace EventParkingReservationSystem.API.Services.Customers
{
    public class CustomerService : ICustomerService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IPasswordHasher<Customer> _passwordHasher;

        public CustomerService(
            ICustomerRepository customerRepository,
            IBookingRepository bookingRepository,
            IPasswordHasher<Customer> passwordHasher)
        {
            _customerRepository = customerRepository;
            _bookingRepository = bookingRepository;
            _passwordHasher = passwordHasher;
        }

        public async Task<CustomerDto> RegisterAsync(
            RegisterCustomerRequestDto request)
        {
            var normalizedEmail = NormalizeEmail(request.Email);

            if (await _customerRepository.EmailExistsAsync(normalizedEmail))
            {
                throw new InvalidOperationException(
                    "An account with this email address already exists.");
            }

            var customer = new Customer
            {
                FirstName = request.FirstName.Trim(),
                LastName = request.LastName.Trim(),
                Email = normalizedEmail,
                Phone = NormalizePhone(request.Phone),

                IsActive = true,
                IsEmailVerified = false,

                CreatedAt = DateTime.UtcNow
            };

            customer.PasswordHash =
                _passwordHasher.HashPassword(
                    customer,
                    request.Password);

            try
            {
                customer =
                    await _customerRepository.AddAsync(customer);
            }
            catch (DbUpdateException)
            {
                if (await _customerRepository
                    .EmailExistsAsync(normalizedEmail))
                {
                    throw new InvalidOperationException(
                        "An account with this email address already exists.");
                }

                throw;
            }

            return MapToDto(customer);
        }

        public async Task<CustomerDto?> GetByIdAsync(
    int customerId)
        {
            var customer =
                await _customerRepository
                    .GetByIdAsync(customerId);

            if (customer is null)
            {
                return null;
            }

            var dto =
                MapToDto(customer);

            dto.BookingCount =
                await _bookingRepository
                    .CountByCustomerIdAsync(
                        customer.CustomerId);

            return dto;
        }

        public async Task<CustomerDto?> UpdateAsync(
            int customerId,
            UpdateCustomerRequestDto request)
        {
            var customer =
                await _customerRepository.GetByIdAsync(customerId);

            if (customer is null)
            {
                return null;
            }

            var normalizedEmail = NormalizeEmail(request.Email);

            var emailChanged =
                !string.Equals(
                    customer.Email,
                    normalizedEmail,
                    StringComparison.OrdinalIgnoreCase);

            if (emailChanged)
            {
                var emailAlreadyExists =
                    await _customerRepository.EmailExistsAsync(
                        normalizedEmail,
                        customerId);

                if (emailAlreadyExists)
                {
                    throw new InvalidOperationException(
                        "An account with this email address already exists.");
                }

                customer.Email = normalizedEmail;

                customer.IsEmailVerified = false;
                customer.EmailVerificationTokenHash = null;
                customer.EmailVerificationTokenExpiresAt = null;
            }

            customer.FirstName = request.FirstName.Trim();
            customer.LastName = request.LastName.Trim();
            customer.Phone = NormalizePhone(request.Phone);
            customer.UpdatedAt = DateTime.UtcNow;

            await _customerRepository.UpdateAsync(customer);

            return MapToDto(customer);
        }

        public async Task<PagedResult<CustomerSummaryDto>> SearchAsync(
            string? search,
            int page,
            int pageSize)
        {
            page = page < 1
                ? 1
                : page;

            pageSize = pageSize switch
            {
                < 1 => 10,
                > 100 => 100,
                _ => pageSize
            };

            var result =
                await _customerRepository.SearchAsync(
                    search,
                    page,
                    pageSize);

            var items =
             new List<CustomerSummaryDto>();

            foreach (var customer in result.Items)
            {
                var dto =
                    MapToSummaryDto(customer);

                dto.BookingCount =
                    await _bookingRepository
                        .CountByCustomerIdAsync(
                            customer.CustomerId);

                items.Add(dto);
            }

            return new PagedResult<CustomerSummaryDto>
            {
                Items = items,
                Page = result.Page,
                PageSize = result.PageSize,
                TotalCount = result.TotalCount
            };
        }

        public async Task<bool> DeactivateAsync(
            int customerId)
        {
            var customer =
                await _customerRepository.GetByIdAsync(customerId);

            if (customer is null)
            {
                return false;
            }

            customer.IsActive = false;
            customer.UpdatedAt = DateTime.UtcNow;

            await _customerRepository.UpdateAsync(customer);

            return true;
        }

        private static string NormalizeEmail(string email)
        {
            return email.Trim().ToLowerInvariant();
        }

        private static string? NormalizePhone(string? phone)
        {
            return string.IsNullOrWhiteSpace(phone)
                ? null
                : phone.Trim();
        }

        private static CustomerDto MapToDto(Customer customer)
        {
            return new CustomerDto
            {
                CustomerId = customer.CustomerId,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                Email = customer.Email,
                Phone = customer.Phone,
                IsActive = customer.IsActive,
                IsEmailVerified = customer.IsEmailVerified,
                CreatedAt = customer.CreatedAt,
                UpdatedAt = customer.UpdatedAt
            };
        }

        private static CustomerSummaryDto MapToSummaryDto(
            Customer customer)
        {
            return new CustomerSummaryDto
            {
                CustomerId = customer.CustomerId,
                FirstName = customer.FirstName,
                LastName = customer.LastName,
                Email = customer.Email,
                IsEmailVerified = customer.IsEmailVerified,
                IsActive = customer.IsActive

                // BookingCount will be connected after
                // the Booking module relationship is available.
            };
        }
    }
}