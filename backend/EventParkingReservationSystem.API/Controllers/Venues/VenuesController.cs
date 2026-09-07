using EventParkingReservationSystem.API.Interfaces.Services.Venues;
using EventParkingReservationSystem.API.Models.DTOs.Venues;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Venues;

[ApiController]
[Route("api/venues")]
public sealed class VenuesController(
    IVenueService service) : ControllerBase
{
    private readonly IVenueService _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<VenueDto>>>
        GetAll(CancellationToken cancellationToken)
    {
        return Ok(
            await _service.GetAllAsync(
                cancellationToken));
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<VenueDto>>
        GetById(
            int id,
            CancellationToken cancellationToken)
    {
        try
        {
            return Ok(
                await _service.GetByIdAsync(
                    id,
                    cancellationToken));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = 404,
                Title = "Venue not found",
                Detail = ex.Message
            });
        }
    }

    [HttpGet("{id:int}/availability")]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<VenueAvailabilityDto>>
        CheckAvailability(
            int id,
            [FromQuery] DateOnly date,
            [FromQuery] TimeOnly start,
            [FromQuery] TimeOnly end,
            [FromQuery] int? excludeEventId,
            CancellationToken cancellationToken)
    {
        try
        {
            return Ok(
                await _service.CheckAvailabilityAsync(
                    id,
                    date,
                    start,
                    end,
                    excludeEventId,
                    cancellationToken));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = 404,
                Detail = ex.Message
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = 400,
                Detail = ex.Message
            });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<VenueDto>>
        Create(
            [FromBody] CreateVenueDto request,
            CancellationToken cancellationToken)
    {
        try
        {
            var result =
                await _service.CreateAsync(
                    request,
                    cancellationToken);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.Id },
                result);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new ProblemDetails
            {
                Status = 400,
                Detail = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails
            {
                Status = 409,
                Title = "Venue conflict",
                Detail = ex.Message
            });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Administrator")]
    public async Task<ActionResult<VenueDto>>
        Update(
            int id,
            [FromBody] UpdateVenueDto request,
            CancellationToken cancellationToken)
    {
        try
        {
            return Ok(
                await _service.UpdateAsync(
                    id,
                    request,
                    cancellationToken));
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = 404,
                Detail = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails
            {
                Status = 409,
                Detail = ex.Message
            });
        }
    }

    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Administrator")]
    public async Task<IActionResult>
        Delete(
            int id,
            CancellationToken cancellationToken)
    {
        try
        {
            await _service.DeleteAsync(
                id,
                cancellationToken);

            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new ProblemDetails
            {
                Status = 404,
                Detail = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new ProblemDetails
            {
                Status = 409,
                Title = "Venue cannot be deleted",
                Detail = ex.Message
            });
        }
    }
}