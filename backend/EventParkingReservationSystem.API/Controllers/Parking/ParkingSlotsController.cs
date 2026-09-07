using System.Security.Claims;
using EventParkingReservationSystem.API.Interfaces.Services.Parking;
using EventParkingReservationSystem.API.Models.DTOs.Parking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Parking;

[ApiController]
[Route("api")]
public class ParkingSlotsController : ControllerBase
{
    private readonly IParkingService
        _parkingService;

    public ParkingSlotsController(
        IParkingService parkingService)
    {
        _parkingService = parkingService;
    }

    [AllowAnonymous]
    [HttpGet(
        "events/{eventId:int}/parking-slots")]
    public async Task<ActionResult<
        IReadOnlyList<ParkingAvailabilityDto>>>
        GetEventParkingSlots(
            int eventId,
            CancellationToken cancellationToken)
    {
        var result =
            await _parkingService
                .GetEventParkingAsync(
                    eventId,
                    cancellationToken);

        return Ok(result);
    }

    [Authorize(Roles = "Administrator")]
    [HttpGet("parking-slots/{id:int}")]
    public async Task<ActionResult<ParkingSlotDto>>
        GetById(
            int id,
            CancellationToken cancellationToken)
    {
        var result =
            await _parkingService.GetByIdAsync(
                id,
                cancellationToken);

        return Ok(result);
    }

    [Authorize(Roles = "Administrator")]
    [HttpPost(
        "events/{eventId:int}/parking-slots")]
    public async Task<ActionResult<ParkingSlotDto>>
        Create(
            int eventId,
            CreateParkingSlotRequest request,
            CancellationToken cancellationToken)
    {
        var result =
            await _parkingService
                .CreateSlotAsync(
                    eventId,
                    request,
                    cancellationToken);

        return CreatedAtAction(
            nameof(GetById),
            new { id = result.Id },
            result);
    }

    [Authorize(Roles = "Administrator")]
    [HttpPut("parking-slots/{id:int}")]
    public async Task<ActionResult<ParkingSlotDto>>
        Update(
            int id,
            UpdateParkingSlotRequestDto request,
            CancellationToken cancellationToken)
    {
        var result =
            await _parkingService
                .UpdateSlotAsync(
                    id,
                    request,
                    cancellationToken);

        return Ok(result);
    }

    [Authorize(Roles = "Administrator")]
    [HttpDelete("parking-slots/{id:int}")]
    public async Task<IActionResult>
        Delete(
            int id,
            CancellationToken cancellationToken)
    {
        await _parkingService
            .DeleteSlotAsync(
                id,
                cancellationToken);

        return NoContent();
    }

    [Authorize(Roles = "Customer")]
    [HttpPost(
        "bookings/{bookingId:int}/parking")]
    public async Task<IActionResult>
        ReserveParking(
            int bookingId,
            ReserveParkingRequest request,
            CancellationToken cancellationToken)
    {
        if (!TryGetCustomerId(
            out var customerId))
        {
            return Unauthorized();
        }

        var result =
            await _parkingService
                .ReserveParkingAsync(
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
                    "PARKING_AVAILABILITY_CHANGED",

                message =
                    result.Message,

                conflictingResourceIds =
                    result
                    .ConflictingParkingSlotId
                    is null
                        ? Array.Empty<int>()
                        : new[]
                        {
                            result
                                .ConflictingParkingSlotId
                                .Value
                        }
            });
        }

        return Ok(new
        {
            message = result.Message
        });
    }

    [Authorize(Roles = "Customer")]
    [HttpDelete(
        "bookings/{bookingId:int}/parking")]
    public async Task<IActionResult>
        RemoveParking(
            int bookingId,
            CancellationToken cancellationToken)
    {
        if (!TryGetCustomerId(
            out var customerId))
        {
            return Unauthorized();
        }

        await _parkingService
            .RemoveParkingAsync(
                bookingId,
                customerId,
                cancellationToken);

        return NoContent();
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