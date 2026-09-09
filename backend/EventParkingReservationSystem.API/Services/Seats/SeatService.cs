using System.Data;
using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Enums.Seats;
using EventParkingReservationSystem.API.Interfaces.Repositories.Bookings;
using EventParkingReservationSystem.API.Interfaces.Repositories.Seats;
using EventParkingReservationSystem.API.Interfaces.Services.Seats;
using EventParkingReservationSystem.API.Mappings.Seats;
using EventParkingReservationSystem.API.Models.DTOs.Seats;
using EventParkingReservationSystem.API.Models.Entities.Bookings;
using EventParkingReservationSystem.API.Models.Entities.Seats;
using EventParkingReservationSystem.API.Validators.Seats;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Services.Seats;

public class SeatService : ISeatService
{
    private readonly ISeatRepository _seatRepository;
    private readonly ISeatSectionRepository _sectionRepository;
    private readonly IBookingRepository _bookingRepository;
    private readonly ApplicationDbContext _context;

    public SeatService(
        ISeatRepository seatRepository,
        ISeatSectionRepository sectionRepository,
        IBookingRepository bookingRepository,
        ApplicationDbContext context)
    {
        _seatRepository = seatRepository;
        _sectionRepository = sectionRepository;
        _bookingRepository = bookingRepository;
        _context = context;
    }

    // =====================================================
    // GET EVENT SEATS
    // =====================================================
    public async Task<IReadOnlyList<SeatAvailabilityDto>>
        GetEventSeatsAsync(
            int eventId,
            CancellationToken cancellationToken = default)
    {
        var seats =
            await _seatRepository.GetByEventAsync(
                eventId,
                cancellationToken);

        if (seats.Count == 0)
        {
            return Array.Empty<SeatAvailabilityDto>();
        }

        var childDiscount =
            seats[0].Event.ChildDiscountPercent;

        return seats
            .Select(x =>
                x.ToAvailabilityDto(childDiscount))
            .ToList();
    }

    // =====================================================
    // GET SEAT BY ID
    // =====================================================
    public async Task<SeatDto> GetByIdAsync(
        int seatId,
        CancellationToken cancellationToken = default)
    {
        var seat =
            await _seatRepository.GetByIdAsync(
                seatId,
                cancellationToken);

        if (seat is null)
        {
            throw new KeyNotFoundException(
                "Seat was not found.");
        }

        return seat.ToDto(
            seat.Event.ChildDiscountPercent);
    }

    // =====================================================
    // CREATE SEAT
    // =====================================================
    public async Task<SeatDto> CreateAsync(
        int eventId,
        CreateSeatRequest request,
        CancellationToken cancellationToken = default)
    {
        var section =
            await _sectionRepository.GetByIdAsync(
                request.SeatSectionId,
                cancellationToken);

        if (section is null ||
            section.EventId != eventId)
        {
            throw new ArgumentException(
                "The selected seat section does not belong to this event.");
        }

        var rowLabel =
            SeatValidator.NormalizeRowLabel(
                request.RowLabel);

        var exists =
            await _seatRepository.PositionExistsAsync(
                eventId,
                request.SeatSectionId,
                rowLabel,
                request.Number,
                null,
                cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException(
                "A seat already exists at this position.");
        }

        var seat = new Seat
        {
            EventId = eventId,

            SeatSectionId =
                request.SeatSectionId,

            RowLabel = rowLabel,

            Number = request.Number,

            Status =
                SeatStatus.Available,

            DisplayOrder =
                request.DisplayOrder,

            PositionX =
                request.PositionX,

            PositionY =
                request.PositionY
        };

        await _seatRepository.AddAsync(
            seat,
            cancellationToken);

        await _seatRepository.SaveChangesAsync(
            cancellationToken);

        var created =
            await _seatRepository.GetByIdAsync(
                seat.Id,
                cancellationToken);

        if (created is null)
        {
            throw new InvalidOperationException(
                "The seat was created but could not be loaded.");
        }

        return created.ToDto(
            created.Event.ChildDiscountPercent);
    }

    // =====================================================
    // UPDATE SEAT
    // =====================================================
    public async Task<SeatDto> UpdateAsync(
        int seatId,
        UpdateSeatRequest request,
        CancellationToken cancellationToken = default)
    {
        var seat =
            await _seatRepository.GetByIdAsync(
                seatId,
                cancellationToken);

        if (seat is null)
        {
            throw new KeyNotFoundException(
                "Seat was not found.");
        }

        if (seat.Status !=
            SeatStatus.Available)
        {
            throw new InvalidOperationException(
                "Held or booked seats cannot be edited.");
        }

        var section =
            await _sectionRepository.GetByIdAsync(
                request.SeatSectionId,
                cancellationToken);

        if (section is null ||
            section.EventId != seat.EventId)
        {
            throw new ArgumentException(
                "The selected section is invalid.");
        }

        var rowLabel =
            SeatValidator.NormalizeRowLabel(
                request.RowLabel);

        var positionExists =
            await _seatRepository.PositionExistsAsync(
                seat.EventId,
                request.SeatSectionId,
                rowLabel,
                request.Number,
                seat.Id,
                cancellationToken);

        if (positionExists)
        {
            throw new InvalidOperationException(
                "Another seat already exists at this position.");
        }

        seat.SeatSectionId =
            request.SeatSectionId;

        seat.RowLabel =
            rowLabel;

        seat.Number =
            request.Number;

        seat.DisplayOrder =
            request.DisplayOrder;

        seat.PositionX =
            request.PositionX;

        seat.PositionY =
            request.PositionY;

        await _seatRepository.SaveChangesAsync(
            cancellationToken);

        var updated =
            await _seatRepository.GetByIdAsync(
                seat.Id,
                cancellationToken);

        if (updated is null)
        {
            throw new InvalidOperationException(
                "The seat was updated but could not be loaded.");
        }

        return updated.ToDto(
            updated.Event.ChildDiscountPercent);
    }

    // =====================================================
    // DELETE SEAT
    // =====================================================
    public async Task DeleteAsync(
        int seatId,
        CancellationToken cancellationToken = default)
    {
        var seat =
            await _seatRepository.GetByIdAsync(
                seatId,
                cancellationToken);

        if (seat is null)
        {
            throw new KeyNotFoundException(
                "Seat was not found.");
        }

        if (seat.Status !=
            SeatStatus.Available)
        {
            throw new InvalidOperationException(
                "Held or booked seats cannot be deleted.");
        }

        _seatRepository.Remove(
            seat);

        await _seatRepository.SaveChangesAsync(
            cancellationToken);
    }

    // =====================================================
    // HOLD SEATS FOR BOOKING
    // =====================================================
    public async Task<SeatHoldResult>
        HoldSeatsForBookingAsync(
            int bookingId,
            int customerId,
            ReserveSeatsRequest request,
            CancellationToken cancellationToken = default)
    {
        SeatValidator.ValidateReserveRequest(
            request);

        var booking =
            await _bookingRepository.GetByIdAsync(
                bookingId);

        if (booking is null)
        {
            throw new KeyNotFoundException(
                "Booking was not found.");
        }

        if (booking.CustomerId !=
            customerId)
        {
            throw new UnauthorizedAccessException(
                "You cannot modify another customer's booking.");
        }

        if (booking.BookingStatus !=
            BookingStatus.Pending)
        {
            throw new InvalidOperationException(
                "Only pending bookings may hold seats.");
        }

        var seatIds =
            request.Seats
                .Select(x => x.SeatId)
                .Distinct()
                .ToArray();

        // =====================================================
        // TRANSACTION OWNERSHIP
        // =====================================================
        //
        // If BookingService already started a transaction,
        // reuse that transaction.
        //
        // If this method is called independently,
        // SeatService creates its own Serializable transaction.
        //
        var transaction =
            _context.Database.CurrentTransaction;

        var ownsTransaction =
            transaction is null;

        if (ownsTransaction)
        {
            transaction =
                await _context.Database
                    .BeginTransactionAsync(
                        IsolationLevel.Serializable,
                        cancellationToken);
        }

        try
        {
            var seats =
                await _seatRepository.GetByIdsAsync(
                    seatIds,
                    cancellationToken);

            if (seats.Count !=
                seatIds.Length)
            {
                if (ownsTransaction &&
                    transaction is not null)
                {
                    await transaction.RollbackAsync(
                        cancellationToken);
                }

                throw new KeyNotFoundException(
                    "One or more selected seats were not found.");
            }

            if (seats.Any(
                x =>
                    x.EventId !=
                    booking.EventId))
            {
                if (ownsTransaction &&
                    transaction is not null)
                {
                    await transaction.RollbackAsync(
                        cancellationToken);
                }

                throw new InvalidOperationException(
                    "One or more seats do not belong to the booking event.");
            }

            if (seats.Any(
                x =>
                    !x.Section
                        .SeatCategory
                        .IsPubliclyBookable))
            {
                if (ownsTransaction &&
                    transaction is not null)
                {
                    await transaction.RollbackAsync(
                        cancellationToken);
                }

                throw new InvalidOperationException(
                    "One or more seats are not publicly bookable.");
            }

            var unavailable =
                seats
                    .Where(x =>
                        x.Status !=
                        SeatStatus.Available)
                    .Select(x => x.Id)
                    .ToArray();

            if (unavailable.Length > 0)
            {
                if (ownsTransaction &&
                    transaction is not null)
                {
                    await transaction.RollbackAsync(
                        cancellationToken);
                }

                return new SeatHoldResult(
                    false,
                    "Seat availability changed.",
                    unavailable);
            }

            var changed =
                await _seatRepository
                    .TryChangeStatusAsync(
                        seatIds,
                        SeatStatus.Available,
                        SeatStatus.Held,
                        cancellationToken);

            if (changed !=
                seatIds.Length)
            {
                var conflicts =
                    await _seatRepository
                        .GetUnavailableSeatIdsAsync(
                            seatIds,
                            cancellationToken);

                if (ownsTransaction &&
                    transaction is not null)
                {
                    await transaction.RollbackAsync(
                        cancellationToken);
                }

                return new SeatHoldResult(
                    false,
                    "One or more seats were taken by another customer.",
                    conflicts);
            }

            foreach (var requestedSeat
                in request.Seats)
            {
                var seat =
                    seats.Single(
                        x =>
                            x.Id ==
                            requestedSeat.SeatId);

                var adultPrice =
                    seat.Section
                        .SeatCategory
                        .AdultPrice;

                var priceSnapshot =
                    requestedSeat.AttendeeType ==
                    AttendeeType.Child

                        ? adultPrice *
                          (1m -
                           seat.Event
                               .ChildDiscountPercent /
                           100m)

                        : adultPrice;

                var bookingSeat =
                    new BookingSeat
                    {
                        BookingId =
                            bookingId,

                        SeatId =
                            seat.Id,

                        AttendeeName =
                            requestedSeat
                                .AttendeeName
                                .Trim(),

                        AttendeeType =
                            requestedSeat
                                .AttendeeType,

                        PriceSnapshot =
                            priceSnapshot
                    };

                await _context
                    .Set<BookingSeat>()
                    .AddAsync(
                        bookingSeat,
                        cancellationToken);
            }

            await _context.SaveChangesAsync(
                cancellationToken);

            // Commit only if SeatService created
            // the transaction itself.
            if (ownsTransaction &&
                transaction is not null)
            {
                await transaction.CommitAsync(
                    cancellationToken);
            }

            return new SeatHoldResult(
                true,
                "Seats held successfully.",
                Array.Empty<int>());
        }
        catch
        {
            // Do not rollback a transaction that belongs
            // to BookingService or another caller.
            if (ownsTransaction &&
                transaction is not null)
            {
                await transaction.RollbackAsync(
                    cancellationToken);
            }

            throw;
        }
        finally
        {
            // Dispose only the transaction
            // created by SeatService itself.
            if (ownsTransaction &&
                transaction is not null)
            {
                await transaction.DisposeAsync();
            }
        }
    }

    // =====================================================
    // CONFIRM SEATS FOR BOOKING
    // =====================================================
    public async Task ConfirmSeatsForBookingAsync(
        int bookingId,
        CancellationToken cancellationToken = default)
    {
        var seatIds =
            await _context
                .Set<BookingSeat>()
                .AsNoTracking()
                .Where(x =>
                    x.BookingId == bookingId)
                .Select(x =>
                    x.SeatId)
                .ToListAsync(
                    cancellationToken);

        if (seatIds.Count == 0)
        {
            return;
        }

        await _seatRepository
            .TryChangeStatusAsync(
                seatIds,
                SeatStatus.Held,
                SeatStatus.Booked,
                cancellationToken);
    }

    // =====================================================
    // RELEASE SEATS FOR BOOKING
    // =====================================================
    public async Task ReleaseSeatsForBookingAsync(
        int bookingId,
        CancellationToken cancellationToken = default)
    {
        var seatIds =
            await _context
                .Set<BookingSeat>()
                .AsNoTracking()
                .Where(x =>
                    x.BookingId == bookingId)
                .Select(x =>
                    x.SeatId)
                .ToListAsync(
                    cancellationToken);

        if (seatIds.Count == 0)
        {
            return;
        }

        await _seatRepository
            .TryChangeStatusAsync(
                seatIds,
                SeatStatus.Held,
                SeatStatus.Available,
                cancellationToken);

        await _seatRepository
            .TryChangeStatusAsync(
                seatIds,
                SeatStatus.Booked,
                SeatStatus.Available,
                cancellationToken);
    }
}