using EventParkingReservationSystem.API.Interfaces.Repositories.Seats;
using EventParkingReservationSystem.API.Models.DTOs.Seats;
using EventParkingReservationSystem.API.Models.Entities.Seats;
using EventParkingReservationSystem.API.Validators.Seats;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Seats;

[ApiController]
[Route("api/events/{eventId:int}/seat-layout")]
[Authorize(Roles = "Administrator")]
public class SeatLayoutController : ControllerBase
{
    private readonly IEventSeatCategoryRepository
        _categoryRepository;

    private readonly ISeatSectionRepository
        _sectionRepository;

    public SeatLayoutController(
        IEventSeatCategoryRepository categoryRepository,
        ISeatSectionRepository sectionRepository)
    {
        _categoryRepository =
            categoryRepository;

        _sectionRepository =
            sectionRepository;
    }

    [HttpGet("categories")]
    public async Task<IActionResult>
        GetCategories(
            int eventId,
            CancellationToken cancellationToken)
    {
        var categories =
            await _categoryRepository
                .GetByEventAsync(
                    eventId,
                    cancellationToken);

        return Ok(categories.Select(x =>
            new
            {
                x.Id,
                x.EventId,
                x.Name,
                x.Code,
                x.AdultPrice,
                x.IsPubliclyBookable,
                x.DisplayOrder
            }));
    }

    [HttpPost("categories")]
    public async Task<IActionResult>
        CreateCategory(
            int eventId,
            CreateEventSeatCategoryRequest request,
            CancellationToken cancellationToken)
    {
        var category =
            new EventSeatCategory
            {
                EventId = eventId,

                Name = request.Name.Trim(),

                Code =
                    SeatValidator
                        .NormalizeCode(
                            request.Code),

                AdultPrice =
                    request.AdultPrice,

                IsPubliclyBookable =
                    request.IsPubliclyBookable,

                DisplayOrder =
                    request.DisplayOrder
            };

        await _categoryRepository.AddAsync(
            category,
            cancellationToken);

        await _categoryRepository
            .SaveChangesAsync(
                cancellationToken);

        return Created(
            $"/api/events/{eventId}/seat-layout/categories/{category.Id}",
            category);
    }

    [HttpGet("sections")]
    public async Task<IActionResult>
        GetSections(
            int eventId,
            CancellationToken cancellationToken)
    {
        var sections =
            await _sectionRepository
                .GetByEventAsync(
                    eventId,
                    cancellationToken);

        return Ok(sections.Select(x =>
            new SeatSectionDto
            {
                Id = x.Id,
                EventId = x.EventId,

                EventSeatCategoryId =
                    x.EventSeatCategoryId,

                Code = x.Code,
                Name = x.Name,

                CategoryName =
                    x.SeatCategory.Name,

                DisplayOrder =
                    x.DisplayOrder,

                SeatCount =
                    x.Seats.Count
            }));
    }

    [HttpPost("sections")]
    public async Task<IActionResult>
        CreateSection(
            int eventId,
            CreateSeatSectionRequest request,
            CancellationToken cancellationToken)
    {
        var category =
            await _categoryRepository
                .GetByIdAsync(
                    request.EventSeatCategoryId,
                    cancellationToken);

        if (category is null ||
            category.EventId != eventId)
        {
            return BadRequest(new
            {
                message =
                    "Invalid seat category."
            });
        }

        var section =
            new SeatSection
            {
                EventId = eventId,

                EventSeatCategoryId =
                    request
                    .EventSeatCategoryId,

                Code =
                    SeatValidator
                        .NormalizeCode(
                            request.Code),

                Name = request.Name.Trim(),

                DisplayOrder =
                    request.DisplayOrder
            };

        await _sectionRepository.AddAsync(
            section,
            cancellationToken);

        await _sectionRepository
            .SaveChangesAsync(
                cancellationToken);

        return Created(
            $"/api/events/{eventId}/seat-layout/sections/{section.Id}",
            section);
    }
}