using EventParkingReservationSystem.API.Common.Exceptions;
using EventParkingReservationSystem.API.Configurations.Booking;
using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Interfaces.Repositories.Bookings;
using EventParkingReservationSystem.API.Interfaces.Services.Bookings;
using EventParkingReservationSystem.API.Interfaces.Services.Notifications;
using EventParkingReservationSystem.API.Interfaces.Services.Parking;
using EventParkingReservationSystem.API.Interfaces.Services.Seats;
using EventParkingReservationSystem.API.Models.DTOs.Bookings;
using EventParkingReservationSystem.API.Models.DTOs.Parking;
using EventParkingReservationSystem.API.Models.DTOs.Seats;
using EventParkingReservationSystem.API.Models.Entities.Bookings;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace EventParkingReservationSystem.API.Services.Bookings;

public class BookingService : IBookingService
{
    private readonly IBookingRepository _bookingRepository;
    private readonly IBookingNumberGenerator _bookingNumberGenerator;
    private readonly ISeatService _seatService;
    private readonly IParkingService _parkingService;
    private readonly BookingHoldOptions _bookingHoldOptions;
    private readonly ApplicationDbContext _context;
    private readonly INotificationService _notificationService;

    public BookingService(
        ApplicationDbContext context,
        IBookingRepository bookingRepository,
        IBookingNumberGenerator bookingNumberGenerator,
        ISeatService seatService,
        IParkingService parkingService,
        INotificationService notificationService,
        IOptions<BookingHoldOptions> bookingHoldOptions)
    {
        _context = context;
        _bookingRepository = bookingRepository;
        _bookingNumberGenerator = bookingNumberGenerator;
        _seatService = seatService;
        _parkingService = parkingService;
        _notificationService = notificationService;
        _bookingHoldOptions = bookingHoldOptions.Value;
    }

    // =====================================================
    // CREATE BOOKING
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
            CustomerId =
                customerId,

            EventId =
                request.EventId,

            BookingStatus =
                BookingStatus.Pending,

            HoldExpiresAtUtc =
                utcNow.AddMinutes(
                    _bookingHoldOptions.HoldDurationMinutes),

            CreatedAt =
                utcNow
        };

        // =====================================
        // INSERT WITH UNIQUE NUMBER RETRY
        // =====================================
        await AddBookingWithUniqueNumberRetryAsync(
            booking);

        try
        {
            // =====================================
            // HOLD SELECTED SEATS
            // =====================================
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

            // =====================================
            // SEAT CONFLICT
            // =====================================
            if (!seatResult.Success)
            {
                throw new BookingConflictException(
                    seatResult.Message,
                    seatResult.ConflictingSeatIds);
            }

            // =====================================
            // OPTIONAL PARKING
            // =====================================
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
                    throw new ParkingConflictException(
                        parkingResult.Message,
                        parkingResult.ConflictingParkingSlotId);
                }
            }

            // =====================================
            // RELOAD FULL BOOKING DETAILS
            // =====================================
            var createdBooking =
                await _bookingRepository
                    .GetByIdAsync(
                        booking.BookingId);

            if (createdBooking is null)
            {
                throw new InvalidOperationException(
                    "The booking was created but could not be loaded.");
            }

            return MapToDto(
                createdBooking);
        }
        catch
        {
            // =====================================
            // COMPENSATING CLEANUP
            // =====================================
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

            await _bookingRepository
                .UpdateAsync(
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
            await _bookingRepository
                .GetByIdAsync(
                    bookingId);

        if (booking is null)
        {
            return null;
        }

        return MapToDto(
            booking);
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
                .GetByCustomerIdAsync(
                    customerId);

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
                .GetByEventIdAsync(
                    eventId);

        return bookings
            .Select(MapToSummaryDto)
            .ToList();
    }

    // =====================================================
    // CANCEL BOOKING
    // =====================================================
    public async Task<CancelBookingResponseDto?> CancelAsync(
        int bookingId,
        int customerId)
    {
        var booking =
            await _bookingRepository
                .GetByIdAsync(
                    bookingId);

        if (booking is null)
        {
            return null;
        }

        if (booking.CustomerId != customerId)
        {
            throw new UnauthorizedAccessException(
                "You cannot cancel another customer's booking.");
        }

        if (booking.BookingStatus ==
            BookingStatus.Cancelled)
        {
            return new CancelBookingResponseDto
            {
                BookingId =
                    booking.BookingId,

                BookingNumber =
                    booking.BookingNumber,

                BookingStatus =
                    booking.BookingStatus,

                Message =
                    "Booking is already cancelled."
            };
        }

        if (booking.BookingStatus ==
            BookingStatus.Expired)
        {
            throw new InvalidOperationException(
                "An expired booking cannot be cancelled.");
        }

        await using var transaction =
            await _context.Database
                .BeginTransactionAsync();

        try
        {
            await _seatService
                .ReleaseSeatsForBookingAsync(
                    booking.BookingId);

            await _parkingService
                .ReleaseParkingForBookingAsync(
                    booking.BookingId);

            booking.BookingStatus =
                BookingStatus.Cancelled;

            booking.UpdatedAt =
                DateTime.UtcNow;

            await _bookingRepository
                .UpdateAsync(
                    booking);

            await _notificationService
                .CreateNotificationAsync(
                    booking.CustomerId,
                    "Booking Cancelled",
                    $"Your booking {booking.BookingNumber} has been cancelled successfully.");

            await transaction
                .CommitAsync();

            return new CancelBookingResponseDto
            {
                BookingId =
                    booking.BookingId,

                BookingNumber =
                    booking.BookingNumber,

                BookingStatus =
                    booking.BookingStatus,

                Message =
                    "Booking cancelled successfully."
            };
        }
        catch
        {
            await transaction
                .RollbackAsync();

            throw;
        }
    }

    // =====================================================
    // CONFIRM BOOKING AFTER PAYMENT
    // =====================================================
    public async Task<BookingDto> ConfirmAfterPaymentAsync(
        int bookingId)
    {
        var booking =
            await _bookingRepository
                .GetByIdAsync(
                    bookingId);

        if (booking is null)
        {
            throw new KeyNotFoundException(
                "Booking was not found.");
        }

        // Already confirmed - safe/idempotent response.
        if (booking.BookingStatus ==
            BookingStatus.Confirmed)
        {
            return MapToDto(
                booking);
        }

        if (booking.BookingStatus ==
            BookingStatus.Cancelled)
        {
            throw new InvalidOperationException(
                "A cancelled booking cannot be confirmed.");
        }

        if (booking.BookingStatus ==
            BookingStatus.Expired)
        {
            throw new InvalidOperationException(
                "An expired booking cannot be confirmed.");
        }

        if (booking.BookingStatus !=
            BookingStatus.Pending)
        {
            throw new InvalidOperationException(
                "Only pending bookings can be confirmed.");
        }

        var utcNow = DateTime.UtcNow;

        if (booking.HoldExpiresAtUtc <= utcNow)
        {
            throw new InvalidOperationException(
                "The booking hold has expired and cannot be confirmed.");
        }

        await using var transaction =
            await _context.Database
                .BeginTransactionAsync();

        try
        {
            // =====================================
            // CONFIRM HELD RESOURCES
            // =====================================
            await _seatService
                .ConfirmSeatsForBookingAsync(
                    booking.BookingId);

            await _parkingService
                .ConfirmParkingForBookingAsync(
                    booking.BookingId);

            // =====================================
            // ATOMIC PENDING -> CONFIRMED
            // =====================================
            //
            // This succeeds only if:
            // Status is still Pending
            // AND the hold has not expired.
            //
            var confirmed =
                await _bookingRepository
                    .TryConfirmPendingAsync(
                        booking.BookingId,
                        utcNow);

            if (!confirmed)
            {
                throw new InvalidOperationException(
                    "The booking could not be confirmed because it is no longer pending or its hold has expired.");
            }

            // ExecuteUpdateAsync bypasses EF's tracked
            // Booking object, so reload it to synchronize
            // the in-memory entity with the database.
            await _context.Entry(booking)
                .ReloadAsync();

            await _notificationService
                .CreateNotificationAsync(
                    booking.CustomerId,
                    "Booking Confirmed",
                    $"Your booking {booking.BookingNumber} has been confirmed successfully.");

            await transaction
                .CommitAsync();

            // Reload complete related details for response.
            var confirmedBooking =
                await _bookingRepository
                    .GetByIdAsync(
                        booking.BookingId);

            if (confirmedBooking is null)
            {
                throw new InvalidOperationException(
                    "The confirmed booking could not be loaded.");
            }

            return MapToDto(
                confirmedBooking);
        }
        catch
        {
            await transaction
                .RollbackAsync();

            throw;
        }
    }

    // =====================================================
    // EXPIRE PENDING BOOKINGS
    // =====================================================
    public async Task<int> ExpirePendingBookingsAsync(
        DateTime utcNow)
    {
        var expiredBookings =
            await _bookingRepository
                .GetExpiredPendingBookingsAsync(
                    utcNow);

        var expiredCount = 0;

        foreach (var booking in expiredBookings)
        {
            await using var transaction =
                await _context.Database
                    .BeginTransactionAsync();

            try
            {
                // =====================================
                // RELEASE HELD RESOURCES
                // =====================================
                await _seatService
                    .ReleaseSeatsForBookingAsync(
                        booking.BookingId);

                await _parkingService
                    .ReleaseParkingForBookingAsync(
                        booking.BookingId);

                // =====================================
                // ATOMIC PENDING -> EXPIRED
                // =====================================
                //
                // This succeeds only if:
                // Status is still Pending
                // AND HoldExpiresAtUtc <= utcNow.
                //
                var expired =
                    await _bookingRepository
                        .TryExpirePendingAsync(
                            booking.BookingId,
                            utcNow);

                if (!expired)
                {
                    // Another operation may have already
                    // confirmed/cancelled/expired this booking.
                    await transaction.RollbackAsync();
                    continue;
                }

                // ExecuteUpdateAsync bypasses tracked
                // entity state, so reload booking.
                await _context.Entry(booking)
                    .ReloadAsync();

                await _notificationService
                    .CreateNotificationAsync(
                        booking.CustomerId,
                        "Booking Expired",
                        $"Your booking {booking.BookingNumber} has expired because payment was not completed within the allowed time.");

                await transaction.CommitAsync();

                expiredCount++;
            }
            catch
            {
                await transaction.RollbackAsync();
                throw;
            }
        }

        return expiredCount;
    }

    // =====================================================
    // UNIQUE BOOKING NUMBER INSERT RETRY
    // =====================================================
    private async Task AddBookingWithUniqueNumberRetryAsync(
        Booking booking)
    {
        const int maxAttempts = 3;

        for (var attempt = 1;
             attempt <= maxAttempts;
             attempt++)
        {
            try
            {
                booking.BookingNumber =
                    await _bookingNumberGenerator
                        .GenerateAsync();

                await _bookingRepository
                    .AddAsync(
                        booking);

                return;
            }
            catch (DbUpdateException ex)
                when (IsUniqueConstraintViolation(ex))
            {
                // Only SQL Server unique-key conflicts
                // should cause a booking-number retry.

                if (attempt >= maxAttempts)
                {
                    throw new InvalidOperationException(
                        "Unable to create a unique booking number after multiple attempts.",
                        ex);
                }

                // The failed entity remains tracked as Added
                // after SaveChanges fails. Detach it before
                // attempting another insert.
                _context.Entry(booking).State =
                    EntityState.Detached;
            }
        }
    }

    // =====================================================
    // SQL SERVER UNIQUE-CONSTRAINT CHECK
    // =====================================================
    private static bool IsUniqueConstraintViolation(
        DbUpdateException exception)
    {
        Exception? currentException =
            exception;

        while (currentException is not null)
        {
            if (currentException is SqlException sqlException &&
                (sqlException.Number == 2601 ||
                 sqlException.Number == 2627))
            {
                return true;
            }

            currentException =
                currentException.InnerException;
        }

        return false;
    }

    // =====================================================
    // ENTITY -> FULL DTO
    // =====================================================
    private static BookingDto MapToDto(
        Booking booking)
    {
        var seatDetails =
            booking.BookingSeats
                .Where(bs =>
                    bs.Seat is not null)
                .Select(bs =>
                    new BookingSeatDetailDto
                    {
                        SeatId =
                            bs.SeatId,

                        SeatCode =
                            bs.Seat.SeatCode,

                        RowLabel =
                            bs.Seat.RowLabel,

                        SeatNumber =
                            bs.Seat.Number,

                        SectionName =
                            bs.Seat.Section?.Name
                            ?? string.Empty,

                        AttendeeName =
                            bs.AttendeeName,

                        AttendeeType =
                            bs.AttendeeType,

                        PriceSnapshot =
                            bs.PriceSnapshot
                    })
                .ToList();

        BookingParkingDetailDto? parkingDetails =
            null;

        if (booking.ParkingReservation is not null)
        {
            var parkingReservation =
                booking.ParkingReservation;

            parkingDetails =
                new BookingParkingDetailDto
                {
                    ParkingReservationId =
                        parkingReservation.Id,

                    ParkingSlotId =
                        parkingReservation.ParkingSlotId,

                    SlotCode =
                        parkingReservation
                            .ParkingSlot?
                            .SlotCode
                        ?? string.Empty,

                    ZoneName =
                        parkingReservation
                            .ZoneNameSnapshot,

                    VehicleType =
                        parkingReservation
                            .VehicleTypeSnapshot,

                    FeeSnapshot =
                        parkingReservation
                            .FeeSnapshot,

                    ReservedAtUtc =
                        parkingReservation
                            .ReservedAtUtc
                };
        }

        var seatTotal =
            seatDetails.Sum(
                seat =>
                    seat.PriceSnapshot);

        var parkingTotal =
            parkingDetails?.FeeSnapshot
            ?? 0m;

        return new BookingDto
        {
            BookingId =
                booking.BookingId,

            BookingNumber =
                booking.BookingNumber,

            CustomerId =
                booking.CustomerId,

            EventId =
                booking.EventId,

            BookingStatus =
                booking.BookingStatus,

            HoldExpiresAtUtc =
                booking.HoldExpiresAtUtc,

            CreatedAt =
                booking.CreatedAt,

            UpdatedAt =
                booking.UpdatedAt,

            Event =
                booking.Event is null
                    ? null
                    : new BookingEventDetailDto
                    {
                        EventId =
                            booking.Event.Id,

                        EventName =
                            booking.Event.Name,

                        Description =
                            booking.Event.Description,

                        EventDate =
                            booking.Event.EventDate,

                        StartTime =
                            booking.Event.StartTime,

                        EndTime =
                            booking.Event.EndTime,

                        VenueName =
                            booking.Event.Venue?.Name
                            ?? string.Empty,

                        CategoryName =
                            booking.Event.Category?.Name
                            ?? string.Empty,

                        PosterUrl =
                            booking.Event.PosterUrl
                    },

            Seats =
                seatDetails,

            Parking =
                parkingDetails,

            TotalAmount =
                seatTotal +
                parkingTotal
        };
    }

    // =====================================================
    // ENTITY -> SUMMARY DTO
    // =====================================================
    private static BookingSummaryDto MapToSummaryDto(
        Booking booking)
    {
        var seatTotal =
            booking.BookingSeats?
                .Sum(bs => bs.PriceSnapshot)
            ?? 0m;

        var parkingTotal =
            booking.ParkingReservation?
                .FeeSnapshot
            ?? 0m;

        return new BookingSummaryDto
        {
            BookingId =
                booking.BookingId,

            BookingNumber =
                booking.BookingNumber,

            CustomerId =
                booking.CustomerId,

            EventId =
                booking.EventId,

            BookingStatus =
                booking.BookingStatus,

            EventName =
                booking.Event?.Name
                ?? string.Empty,

            EventDate =
                booking.Event?.EventDate,

            StartTime =
                booking.Event?.StartTime,

            VenueName =
                booking.Event?.Venue?.Name
                ?? string.Empty,

            PosterUrl =
                booking.Event?.PosterUrl,

            SeatCount =
                booking.BookingSeats?.Count
                ?? 0,

            HasParking =
                booking.ParkingReservation is not null,

            TotalAmount =
                seatTotal +
                parkingTotal,

            HoldExpiresAtUtc =
                booking.HoldExpiresAtUtc,

            CreatedAt =
                booking.CreatedAt
        };
    }
}