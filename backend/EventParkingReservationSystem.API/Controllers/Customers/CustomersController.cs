using EventParkingReservationSystem.API.Interfaces.Services.Auth;
using EventParkingReservationSystem.API.Interfaces.Services.Customers;
using EventParkingReservationSystem.API.Models.DTOs.Customers;
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
}