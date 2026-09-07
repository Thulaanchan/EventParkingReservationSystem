using System.Security.Claims;
using EventParkingReservationSystem.API.Interfaces.Services.Seats;
using EventParkingReservationSystem.API.Models.DTOs.Seats;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Seats;

[ApiController]
[Route("api")]
public class SeatsController : ControllerBase
{
    private readonly ISeatService _seatService;

    public SeatsController(
        ISeatService seatService)
    {
        _seatService = seatService;
    }

    [AllowAnonymous]
    [HttpGet("events/{eventId:int}/seats")]
    public async Task<ActionResult<
        IReadOnlyList<SeatAvailabilityDto>>>
        GetEventSeats(
            int eventId,
            CancellationToken cancellationToken)
    {
        var result =
            await _seatService
                .GetEventSeatsAsync(
                    eventId,
                    cancellationToken);

        return Ok(result);
    }

    [Authorize(Roles = "Administrator")]
    [HttpGet("seats/{id:int}")]
    public async Task<ActionResult<SeatDto>>
        GetSeatById(
            int id,
            CancellationToken cancellationToken)
    {
        var seat =
            await _seatService.GetByIdAsync(
                id,
                cancellationToken);

        return Ok(seat);
    }

    [Authorize(Roles = "Administrator")]
    [HttpPost("events/{eventId:int}/seats")]
    public async Task<ActionResult<SeatDto>>
        CreateSeat(
            int eventId,
            CreateSeatRequest request,
            CancellationToken cancellationToken)
    {
        var seat =
            await _seatService.CreateAsync(
                eventId,
                request,
                cancellationToken);

        return CreatedAtAction(
            nameof(GetSeatById),
            new { id = seat.Id },
            seat);
    }

    [Authorize(Roles = "Administrator")]
    [HttpPut("seats/{id:int}")]
    public async Task<ActionResult<SeatDto>>
        UpdateSeat(
            int id,
            UpdateSeatRequest request,
            CancellationToken cancellationToken)
    {
        var result =
            await _seatService.UpdateAsync(
                id,
                request,
                cancellationToken);

        return Ok(result);
    }

    [Authorize(Roles = "Administrator")]
    [HttpDelete("seats/{id:int}")]
    public async Task<IActionResult>
        DeleteSeat(
            int id,
            CancellationToken cancellationToken)
    {
        await _seatService.DeleteAsync(
            id,
            cancellationToken);

        return NoContent();
    }

    [Authorize(Roles = "Customer")]
    [HttpPost("bookings/{bookingId:int}/seats")]
    public async Task<IActionResult>
        HoldSeats(
            int bookingId,
            ReserveSeatsRequest request,
            CancellationToken cancellationToken)
    {
        if (!TryGetCustomerId(
            out var customerId))
        {
            return Unauthorized();
        }

        var result =
            await _seatService
                .HoldSeatsForBookingAsync(
                    bookingId,
                    customerId,
                    request,
                    cancellationToken);

        if (!result.Success)
        {
            return Conflict(new
            {
                status = 409,

                code =
                    "SEAT_AVAILABILITY_CHANGED",

                message =
                    result.Message,

                conflictingResourceIds =
                    result.ConflictingSeatIds
            });
        }

        return Ok(new
        {
            message = result.Message
        });
    }

    private bool TryGetCustomerId(
        out int customerId)
    {
        customerId = 0;

        var value =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        return int.TryParse(
            value,
            out customerId);
    }
}