using EventParkingReservationSystem.API.Interfaces.Services.Categories;
using EventParkingReservationSystem.API.Models.DTOs.Categories;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Categories;

[ApiController]
[Route("api/categories")]
public sealed class CategoriesController(
    ICategoryService service) : ControllerBase
{
    private readonly ICategoryService _service = service;

    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<IReadOnlyList<CategoryDto>>>
        GetAll(CancellationToken cancellationToken)
    {
        return Ok(
            await _service.GetAllAsync(
                cancellationToken));
    }

    [HttpGet("{id:int}")]
    [AllowAnonymous]
    public async Task<ActionResult<CategoryDto>>
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
    public async Task<ActionResult<CategoryDto>>
        Create(
            [FromBody] CreateCategoryDto request,
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
    public async Task<ActionResult<CategoryDto>>
        Update(
            int id,
            [FromBody] UpdateCategoryDto request,
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
                Title = "Category cannot be deleted",
                Detail = ex.Message
            });
        }
    }
}