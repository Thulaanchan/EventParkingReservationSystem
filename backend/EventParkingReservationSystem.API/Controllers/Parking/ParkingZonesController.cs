using EventParkingReservationSystem.API.Interfaces.Services.Parking;
using EventParkingReservationSystem.API.Models.DTOs.Parking;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Parking;

[ApiController]
[Route("api")]
public class ParkingZonesController : ControllerBase
{
    private readonly IParkingZoneService
        _parkingZoneService;

    public ParkingZonesController(
        IParkingZoneService parkingZoneService)
    {
        _parkingZoneService =
            parkingZoneService;
    }

    [AllowAnonymous]
    [HttpGet(
        "events/{eventId:int}/parking-zones")]
    public async Task<IActionResult>
        GetEventZones(
            int eventId,
            CancellationToken cancellationToken)
    {
        var result =
            await _parkingZoneService
                .GetEventZonesAsync(
                    eventId,
                    cancellationToken);

        return Ok(result);
    }

    [Authorize(Roles = "Administrator")]
    [HttpPost(
        "events/{eventId:int}/parking-zones")]
    public async Task<IActionResult>
        CreateZone(
            int eventId,
            CreateParkingZoneRequest request,
            CancellationToken cancellationToken)
    {
        try
        {
            var result =
                await _parkingZoneService
                    .CreateAsync(
                        eventId,
                        request,
                        cancellationToken);

            return Created(
                $"/api/parking-zones/{result.Id}",
                result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = 400,
                Title = "Invalid parking zone request",
                Detail = ex.Message
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Resource not found",
                Detail = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails
            {
                Status = 409,
                Title = "Parking zone conflict",
                Detail = ex.Message
            });
        }
    }

    [Authorize(Roles = "Administrator")]
    [HttpPut("parking-zones/{id:int}")]
    public async Task<IActionResult>
        UpdateZone(
            int id,
            UpdateParkingZoneRequest request,
            CancellationToken cancellationToken)
    {
        try
        {
            var result =
                await _parkingZoneService
                    .UpdateAsync(
                        id,
                        request,
                        cancellationToken);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = 400,
                Title = "Invalid parking zone request",
                Detail = ex.Message
            });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Parking zone not found",
                Detail = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails
            {
                Status = 409,
                Title = "Parking zone conflict",
                Detail = ex.Message
            });
        }
    }
}