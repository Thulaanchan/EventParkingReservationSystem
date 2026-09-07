using EventParkingReservationSystem.API.Common.Pagination;
using EventParkingReservationSystem.API.Interfaces.Services.Events;
using EventParkingReservationSystem.API.Models.DTOs.Events;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Events;

[ApiController]
[Route("api/events")]
public sealed class EventsController(
    IEventService service) : ControllerBase
{
    private readonly IEventService _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<EventListItemDto>>>
        GetAll(
            [FromQuery] EventQueryDto query,
            CancellationToken cancellationToken)
    {
        /*
         * Public users should not force past-event listing.
         * Only Administrator can use IncludePast.
         */
        var includePast =
            query.IncludePast &&
            User.IsInRole("Administrator");

        return Ok(
            await _service.SearchAsync(
                query,
                includePast,
                cancellationToken));
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<EventDetailsDto>>
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
                Detail = ex.Message
            });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Administrator")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<EventDetailsDto>>
        Create(
            [FromForm] CreateEventDto request,
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
                Detail = ex.Message
            });
        }
    }

    [HttpPut("{id:int}")]
    [Authorize(Roles = "Administrator")]
    [Consumes("multipart/form-data")]
    public async Task<ActionResult<EventDetailsDto>>
        Update(
            int id,
            [FromForm] UpdateEventDto request,
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
                Title = "Event cannot be deleted",
                Detail = ex.Message
            });
        }
    }
}