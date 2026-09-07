using EventParkingReservationSystem.API.Configurations.Booking;
using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Interfaces.Repositories.Bookings;
using EventParkingReservationSystem.API.Interfaces.Services.Bookings;
using EventParkingReservationSystem.API.Interfaces.Services.Parking;
using EventParkingReservationSystem.API.Interfaces.Services.Seats;
using EventParkingReservationSystem.API.Models.DTOs.Bookings;
using EventParkingReservationSystem.API.Models.DTOs.Parking;
using EventParkingReservationSystem.API.Models.DTOs.Seats;
using EventParkingReservationSystem.API.Models.Entities.Bookings;
using Microsoft.Extensions.Options;

namespace EventParkingReservationSystem.API.Services.Bookings;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IBookingNumberGenerator _bookingNumberGenerator;
    private readonly ISeatService _seatService;
    private readonly IParkingService _parkingService;
    private readonly BookingHoldOptions _bookingHoldOptions;

    public BookingService(
        IBookingRepository bookingRepository,
        IBookingNumberGenerator bookingNumberGenerator,
        ISeatService seatService,
        IParkingService parkingService,
        IOptions<BookingHoldOptions> bookingHoldOptions)
    {
        _bookingRepository = bookingRepository;
        _bookingNumberGenerator = bookingNumberGenerator;
        _seatService = seatService;
        _parkingService = parkingService;
        _bookingHoldOptions = bookingHoldOptions.Value;
    }

    // =====================================================
    // CREATE BOOKING
    // Will be implemented in the next step with
    // Seat + Parking hold logic.
    // =====================================================
    public async Task<BookingDto> CreateAsync(
    int customerId,
    CreateBookingRequestDto request)
    {
        if (customerId <= 0)
        {
            throw new ArgumentException(
                "A valid customer is required.");
        }

        if (request.Seats is null ||
            request.Seats.Count == 0)
        {
            throw new ArgumentException(
                "At least one seat must be selected.");
        }

        var utcNow = DateTime.UtcNow;

        var booking = new Booking
        {
            BookingNumber =
                await _bookingNumberGenerator.GenerateAsync(),

            CustomerId = customerId,

            EventId = request.EventId,

            BookingStatus =
                BookingStatus.Pending,

            HoldExpiresAtUtc =
                utcNow.AddMinutes(
                    _bookingHoldOptions
                        .HoldDurationMinutes),

            CreatedAt = utcNow
        };

        await _bookingRepository.AddAsync(
            booking);

        try
        {
            // =========================
            // HOLD SELECTED SEATS
            // =========================

            var seatRequest =
                new ReserveSeatsRequest
                {
                    Seats = request.Seats
                };

            var seatResult =
                await _seatService
                    .HoldSeatsForBookingAsync(
                        booking.BookingId,
                        customerId,
                        seatRequest);

            if (!seatResult.Success)
            {
                throw new InvalidOperationException(
                    seatResult.Message);
            }

            // =========================
            // OPTIONAL PARKING
            // =========================

            if (request.ParkingSlotId.HasValue)
            {
                var parkingRequest =
                    new ReserveParkingRequest
                    {
                        ParkingSlotId =
                            request.ParkingSlotId.Value
                    };

                var parkingResult =
                    await _parkingService
                        .ReserveParkingAsync(
                            booking.BookingId,
                            customerId,
                            parkingRequest);

                if (!parkingResult.Success)
                {
                    throw new InvalidOperationException(
                        parkingResult.Message);
                }
            }

            return MapToDto(booking);
        }
        catch
        {
            // =========================
            // COMPENSATING CLEANUP
            // =========================
            //
            // If any part of booking creation fails,
            // release any resources that may already
            // have been held.

            if (request.ParkingSlotId.HasValue)
            {
                await _parkingService
                    .RemoveParkingAsync(
                        booking.BookingId,
                        customerId);
            }

            await _seatService
                .ReleaseSeatsForBookingAsync(
                    booking.BookingId);

            booking.BookingStatus =
                BookingStatus.Cancelled;

            booking.UpdatedAt =
                DateTime.UtcNow;

            await _bookingRepository.UpdateAsync(
                booking);

            throw;
        }
    }

    // =====================================================
    // GET BOOKING BY ID
    // =====================================================
    public async Task<BookingDto?> GetByIdAsync(
        int bookingId)
    {
        var booking =
            await _bookingRepository.GetByIdAsync(
                bookingId);

        if (booking is null)
        {
            return null;
        }

        return MapToDto(booking);
    }

    // =====================================================
    // CUSTOMER BOOKING HISTORY
    // =====================================================
    public async Task<IReadOnlyList<BookingSummaryDto>>
        GetCustomerBookingsAsync(
            int customerId)
    {
        var bookings =
            await _bookingRepository
                .GetByCustomerIdAsync(customerId);

        return bookings
            .Select(MapToSummaryDto)
            .ToList();
    }

    // =====================================================
    // ADMIN - BOOKINGS BY EVENT
    // =====================================================
    public async Task<IReadOnlyList<BookingSummaryDto>>
        GetEventBookingsAsync(
            int eventId)
    {
        var bookings =
            await _bookingRepository
                .GetByEventIdAsync(eventId);

        return bookings
            .Select(MapToSummaryDto)
            .ToList();
    }

    // =====================================================
    // CANCEL BOOKING
    // Will be implemented after CreateAsync.
    // =====================================================
    public Task<CancelBookingResponseDto?> CancelAsync(
        int bookingId,
        int customerId)
    {
        throw new NotImplementedException();
    }

    // =====================================================
    // EXPIRE PENDING BOOKINGS
    // Will be implemented after cancellation logic.
    // =====================================================
    public Task<int> ExpirePendingBookingsAsync(
        DateTime utcNow)
    {
        throw new NotImplementedException();
    }

    // =====================================================
    // ENTITY -> FULL DTO
    // =====================================================
    private static BookingDto MapToDto(
        Booking booking)
    {
        return new BookingDto
        {
            BookingId = booking.BookingId,
            BookingNumber = booking.BookingNumber,
            CustomerId = booking.CustomerId,
            EventId = booking.EventId,
            BookingStatus = booking.BookingStatus,
            HoldExpiresAtUtc =
                booking.HoldExpiresAtUtc,
            CreatedAt = booking.CreatedAt,
            UpdatedAt = booking.UpdatedAt
        };
    }

    // =====================================================
    // ENTITY -> SUMMARY DTO
    // =====================================================
    private static BookingSummaryDto MapToSummaryDto(
        Booking booking)
    {
        return new BookingSummaryDto
        {
            BookingId = booking.BookingId,
            BookingNumber = booking.BookingNumber,
            CustomerId = booking.CustomerId,
            EventId = booking.EventId,
            BookingStatus = booking.BookingStatus,
            HoldExpiresAtUtc =
                booking.HoldExpiresAtUtc,
            CreatedAt = booking.CreatedAt
        };
    }
}