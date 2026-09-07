using System.Security.Claims;
using EventParkingReservationSystem.API.Common.Constants;
using EventParkingReservationSystem.API.Interfaces.Services.Bookings;
using EventParkingReservationSystem.API.Models.DTOs.Bookings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace EventParkingReservationSystem.API.Controllers.Bookings;

[ApiController]
[Route("api/bookings")]
public class BookingsController : ControllerBase
{
    private readonly IBookingService _bookingService;

    public BookingsController(
        IBookingService bookingService)
    {
        _bookingService = bookingService;
    }

    // =====================================================
    // 1. CREATE BOOKING
    // POST: /api/bookings
    // Customer only
    // =====================================================

    [Authorize(Roles = AppRoles.Customer)]
    [HttpPost]
    public async Task<ActionResult<BookingDto>> Create(
        [FromBody] CreateBookingRequestDto request)
    {
        if (!TryGetAuthenticatedUserId(
                out var customerId))
        {
            return Unauthorized(new
            {
                message =
                    "Invalid authentication token."
            });
        }

        try
        {
            var booking =
                await _bookingService.CreateAsync(
                    customerId,
                    request);

            return StatusCode(
                StatusCodes.Status201Created,
                booking);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new
            {
                message = ex.Message
            });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }


    // =====================================================
    // 2. GET BOOKING BY ID
    // GET: /api/bookings/10
    //
    // Customer -> own booking only
    // Administrator -> any booking
    // =====================================================

    [Authorize(
        Roles =
            AppRoles.Customer + "," +
            AppRoles.Administrator)]
    [HttpGet("{id:int}")]
    public async Task<ActionResult<BookingDto>> GetById(
        int id)
    {
        if (!TryGetAuthenticatedUserId(
                out var authenticatedUserId))
        {
            return Unauthorized(new
            {
                message =
                    "Invalid authentication token."
            });
        }

        var booking =
            await _bookingService.GetByIdAsync(id);

        if (booking is null)
        {
            return NotFound(new
            {
                message =
                    "Booking not found."
            });
        }

        var isAdministrator =
            User.IsInRole(
                AppRoles.Administrator);

        if (!isAdministrator &&
            booking.CustomerId != authenticatedUserId)
        {
            return Forbid();
        }

        return Ok(booking);
    }


    // =====================================================
    // 3. CUSTOMER BOOKING HISTORY
    //
    // GET:
    // /api/bookings/customer/5
    //
    // Customer -> own history only
    // Administrator -> any customer's history
    // =====================================================

    [Authorize(
        Roles =
            AppRoles.Customer + "," +
            AppRoles.Administrator)]
    [HttpGet("customer/{customerId:int}")]
    public async Task<
        ActionResult<IReadOnlyList<BookingSummaryDto>>>
        GetCustomerBookings(
            int customerId)
    {
        if (!TryGetAuthenticatedUserId(
                out var authenticatedUserId))
        {
            return Unauthorized(new
            {
                message =
                    "Invalid authentication token."
            });
        }

        var isAdministrator =
            User.IsInRole(
                AppRoles.Administrator);

        if (!isAdministrator &&
            authenticatedUserId != customerId)
        {
            return Forbid();
        }

        var bookings =
            await _bookingService
                .GetCustomerBookingsAsync(
                    customerId);

        return Ok(bookings);
    }


    // =====================================================
    // 4. ADMIN - BOOKINGS BY EVENT
    //
    // GET:
    // /api/bookings?eventId=10
    //
    // Administrator only
    // =====================================================

    [Authorize(Roles = AppRoles.Administrator)]
    [HttpGet]
    public async Task<
        ActionResult<IReadOnlyList<BookingSummaryDto>>>
        GetEventBookings(
            [FromQuery] int eventId)
    {
        if (eventId <= 0)
        {
            return BadRequest(new
            {
                message =
                    "A valid event ID is required."
            });
        }

        var bookings =
            await _bookingService
                .GetEventBookingsAsync(
                    eventId);

        return Ok(bookings);
    }


    // =====================================================
    // 5. CANCEL OWN BOOKING
    //
    // DELETE:
    // /api/bookings/10
    //
    // Customer only
    // =====================================================

    [Authorize(Roles = AppRoles.Customer)]
    [HttpDelete("{id:int}")]
    public async Task<
        ActionResult<CancelBookingResponseDto>>
        Cancel(
            int id)
    {
        if (!TryGetAuthenticatedUserId(
                out var customerId))
        {
            return Unauthorized(new
            {
                message =
                    "Invalid authentication token."
            });
        }

        try
        {
            var result =
                await _bookingService.CancelAsync(
                    id,
                    customerId);

            if (result is null)
            {
                return NotFound(new
                {
                    message =
                        "Booking not found."
                });
            }

            return Ok(result);
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new
            {
                message = ex.Message
            });
        }
    }


    // =====================================================
    // JWT USER ID HELPER
    // =====================================================

    private bool TryGetAuthenticatedUserId(
        out int userId)
    {
        var userIdClaim =
            User.FindFirstValue(
                ClaimTypes.NameIdentifier);

        return int.TryParse(
            userIdClaim,
            out userId);
    }
}