using System.Security.Claims;
using EventParkingReservationSystem.API.Common.Constants;
using EventParkingReservationSystem.API.Interfaces.Services.Dashboards;
using EventParkingReservationSystem.API.Models.DTOs.Dashboards;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Dashboards;

[ApiController]
[Authorize(Roles = AppRoles.Customer)]
[Route("api/customer/dashboard")]
public sealed class CustomerDashboardController
    : ControllerBase
{
    private readonly ICustomerDashboardService
        _customerDashboardService;

    public CustomerDashboardController(
        ICustomerDashboardService customerDashboardService)
    {
        _customerDashboardService =
            customerDashboardService;
    }

    [HttpGet("summary")]
    public async Task<ActionResult<CustomerDashboardSummaryDto>>
        GetSummary(
            CancellationToken cancellationToken)
    {
        if (!TryGetAuthenticatedCustomerId(
                out var customerId))
        {
            return Unauthorized();
        }

        var summary =
            await _customerDashboardService
                .GetSummaryAsync(
                    customerId,
                    cancellationToken);

        return Ok(summary);
    }

    private bool TryGetAuthenticatedCustomerId(
        out int customerId)
    {
        customerId = 0;

        var customerIdValue =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        return int.TryParse(
            customerIdValue,
            out customerId);
    }
}