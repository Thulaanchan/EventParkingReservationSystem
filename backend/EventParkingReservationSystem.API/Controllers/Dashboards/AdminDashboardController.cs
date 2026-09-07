using EventParkingReservationSystem.API.Interfaces.Services.Dashboards;
using EventParkingReservationSystem.API.Models.DTOs.Dashboards;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Dashboards;

[ApiController]
[Authorize(Roles = "Administrator")]
[Route("api/admin/dashboard")]
public sealed class AdminDashboardController(
    IAdminDashboardService service)
    : ControllerBase
{
    private readonly IAdminDashboardService _service =
        service;

    [HttpGet("summary")]
    public async Task<ActionResult<AdminDashboardSummaryDto>>
        GetSummary(
            CancellationToken cancellationToken)
    {
        return Ok(
            await _service.GetSummaryAsync(
                cancellationToken));
    }

    [HttpGet("upcoming-events")]
    public async Task<ActionResult<IReadOnlyList<UpcomingEventDto>>>
        GetUpcomingEvents(
            CancellationToken cancellationToken)
    {
        return Ok(
            await _service.GetUpcomingEventsAsync(
                cancellationToken));
    }

    [HttpGet("recent-bookings")]
    public async Task<ActionResult<IReadOnlyList<RecentBookingDto>>>
        GetRecentBookings(
            CancellationToken cancellationToken)
    {
        return Ok(
            await _service.GetRecentBookingsAsync(
                cancellationToken));
    }
}