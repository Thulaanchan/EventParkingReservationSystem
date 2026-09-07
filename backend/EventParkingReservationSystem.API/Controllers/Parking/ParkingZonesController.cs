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

    [Authorize(Roles = "Administrator")]
    [HttpPut("parking-zones/{id:int}")]
    public async Task<IActionResult>
        UpdateZone(
            int id,
            UpdateParkingZoneRequest request,
            CancellationToken cancellationToken)
    {
        var result =
            await _parkingZoneService
                .UpdateAsync(
                    id,
                    request,
                    cancellationToken);

        return Ok(result);
    }
}