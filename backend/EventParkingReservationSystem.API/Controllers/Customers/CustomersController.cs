using System.Security.Claims;
using EventParkingReservationSystem.API.Interfaces.Services.Auth;
using EventParkingReservationSystem.API.Interfaces.Services.Customers;
using EventParkingReservationSystem.API.Models.DTOs.Auth;
using EventParkingReservationSystem.API.Models.DTOs.Customers;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Customers;

[ApiController]
[Route("api/customers")]
public class CustomersController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly ICustomerService _customerService;

    public CustomersController(
        IAuthService authService,
        ICustomerService customerService)
    {
        _authService = authService;
        _customerService = customerService;
    }

    // =========================
    // 1. REGISTER CUSTOMER
    // POST: /api/customers/register
    // =========================
    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<CustomerDto>> Register(
        [FromBody] RegisterCustomerRequestDto request)
    {
        try
        {
            var customer =
                await _authService.RegisterAsync(request);

            return StatusCode(
                StatusCodes.Status201Created,
                customer);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    // =========================
    // 2. GET CUSTOMER BY ID
    // GET: /api/customers/5
    //
    // Customer:
    // can view only own profile
    //
    // Administrator:
    // can view any customer profile
    // =========================
    [Authorize(Roles = "Customer,Administrator")]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<CustomerDto>> GetById(
        int id)
    {
        var userIdClaim =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        var role =
            User.FindFirstValue(
                ClaimTypes.Role);

        if (!int.TryParse(
                userIdClaim,
                out var authenticatedUserId))
        {
            return Unauthorized(new
            {
                message =
                    "Invalid authentication token."
            });
        }

        var isAdministrator =
            string.Equals(
                role,
                "Administrator",
                StringComparison.OrdinalIgnoreCase);

        if (!isAdministrator &&
            authenticatedUserId != id)
        {
            return Forbid();
        }

        var customer =
            await _customerService.GetByIdAsync(id);

        if (customer is null)
        {
            return NotFound(new
            {
                message =
                    "Customer not found."
            });
        }

        return Ok(customer);
    }

    // =========================
    // 3. UPDATE OWN PROFILE
    // PUT: /api/customers/5
    //
    // Only Customer role
    // Customer can update only own profile
    // =========================
    [Authorize(Roles = "Customer")]
    [HttpPut("{id:int}")]
    public async Task<ActionResult<CustomerDto>> Update(
        int id,
        [FromBody] UpdateCustomerRequestDto request)
    {
        var userIdClaim =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        if (!int.TryParse(
                userIdClaim,
                out var authenticatedCustomerId))
        {
            return Unauthorized(new
            {
                message =
                    "Invalid authentication token."
            });
        }

        if (authenticatedCustomerId != id)
        {
            return Forbid();
        }

        var existingCustomer =
            await _customerService.GetByIdAsync(id);

        if (existingCustomer is null)
        {
            return NotFound(new
            {
                message =
                    "Customer not found."
            });
        }

        var normalizedRequestedEmail =
            request.Email
                .Trim()
                .ToLowerInvariant();

        var emailChanged =
            !string.Equals(
                existingCustomer.Email,
                normalizedRequestedEmail,
                StringComparison.OrdinalIgnoreCase);

        try
        {
            var updatedCustomer =
                await _customerService.UpdateAsync(
                    id,
                    request);

            if (updatedCustomer is null)
            {
                return NotFound(new
                {
                    message =
                        "Customer not found."
                });
            }

            if (emailChanged)
            {
                await _authService
                    .ResendVerificationEmailAsync(
                        new ResendVerificationRequestDto
                        {
                            Email =
                                updatedCustomer.Email
                        });
            }

            return Ok(updatedCustomer);
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }

    // =========================
    // 4. ADMIN SEARCH CUSTOMERS
    //
    // GET: /api/customers
    // GET: /api/customers?search=aari
    //
    // Administrator only
    // =========================
    [Authorize(Roles = "Administrator")]
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<CustomerSummaryDto>>> Search(
        [FromQuery] string? search)
    {
        var customers =
            await _customerService.SearchAsync(search);

        return Ok(customers);
    }

    // =========================
    // 5. ADMIN DEACTIVATE CUSTOMER
    //
    // DELETE: /api/customers/5
    //
    // This does NOT physically delete customer.
    // It sets IsActive = false.
    // Administrator only.
    // =========================
    [Authorize(Roles = "Administrator")]
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Deactivate(
        int id)
    {
        var deactivated =
            await _customerService.DeactivateAsync(id);

        if (!deactivated)
        {
            return NotFound(new
            {
                message =
                    "Customer not found."
            });
        }

        return Ok(new
        {
            message =
                "Customer account deactivated successfully."
        });
    }
}