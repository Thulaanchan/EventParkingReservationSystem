using EventParkingReservationSystem.API.Interfaces.Services.Customers;
using EventParkingReservationSystem.API.Models.DTOs.Customers;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Customers;

[ApiController]
[Route("api/customers")]
public class CustomersController : ControllerBase
{
    private readonly ICustomerService _customerService;

    public CustomersController(ICustomerService customerService)
    {
        _customerService = customerService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<CustomerResponseDto>> Register(
        RegisterCustomerDto request)
    {
        try
        {
            var customer =
                await _customerService.RegisterAsync(request);

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