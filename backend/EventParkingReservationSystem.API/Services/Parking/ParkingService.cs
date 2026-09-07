using EventParkingReservationSystem.API.Data.Context;
using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Enums.Parking;
using EventParkingReservationSystem.API.Interfaces.Repositories.Bookings;
using EventParkingReservationSystem.API.Interfaces.Repositories.Parking;
using EventParkingReservationSystem.API.Interfaces.Services.Parking;
using EventParkingReservationSystem.API.Mappings.Parking;
using EventParkingReservationSystem.API.Models.DTOs.Parking;
using EventParkingReservationSystem.API.Models.Entities.Parking;
using EventParkingReservationSystem.API.Models.Entities.ParkingReservations;
using EventParkingReservationSystem.API.Validators.Parking;
using Microsoft.EntityFrameworkCore;
using System.Data;

namespace EventParkingReservationSystem.API.Services.Parking;

public class ParkingService : IParkingService
{
    private readonly IParkingSlotRepository
        _slotRepository;

    private readonly IParkingZoneRepository
        _zoneRepository;

    private readonly IParkingReservationRepository
        _reservationRepository;

    private readonly IBookingRepository
        _bookingRepository;

    private readonly ApplicationDbContext
        _context;

    public ParkingService(
        IParkingSlotRepository slotRepository,
        IParkingZoneRepository zoneRepository,
        IParkingReservationRepository reservationRepository,
        IBookingRepository bookingRepository,
        ApplicationDbContext context)
    {
        _slotRepository = slotRepository;
        _zoneRepository = zoneRepository;
        _reservationRepository =
            reservationRepository;

        _bookingRepository = bookingRepository;
        _context = context;
    }

    public async Task<
        IReadOnlyList<ParkingAvailabilityDto>>
        GetEventParkingAsync(
            int eventId,
            CancellationToken cancellationToken = default)
    {
        var slots =
            await _slotRepository
                .GetByEventAsync(
                    eventId,
                    cancellationToken);

        return slots
            .Select(x =>
                x.ToAvailabilityDto())
            .ToList();
    }

    public async Task<ParkingSlotDto>
        GetByIdAsync(
            int slotId,
            CancellationToken cancellationToken = default)
    {
        var slot =
            await _slotRepository.GetByIdAsync(
                slotId,
                cancellationToken);

        if (slot is null)
        {
            throw new KeyNotFoundException(
                "Parking slot was not found.");
        }

        return slot.ToDto();
    }

    public async Task<ParkingSlotDto>
        CreateSlotAsync(
            int eventId,
            CreateParkingSlotRequest request,
            CancellationToken cancellationToken = default)
    {
        var zone =
            await _zoneRepository.GetByIdAsync(
                request.ParkingZoneId,
                cancellationToken);

        if (zone is null ||
            zone.EventId != eventId)
        {
            throw new ArgumentException(
                "The selected parking zone does not belong to this event.");
        }

        var slotCode =
            ParkingValidator
                .NormalizeSlotCode(
                    request.SlotCode);

        var exists =
            await _slotRepository
                .SlotCodeExistsAsync(
                    eventId,
                    slotCode,
                    null,
                    cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException(
                "This parking slot code already exists for the event.");
        }

        var slot = new ParkingSlot
        {
            EventId = eventId,

            ParkingZoneId =
                request.ParkingZoneId,

            SlotCode = slotCode,

            Status =
                ParkingStatus.Available,

            DisplayOrder =
                request.DisplayOrder,

            PositionX =
                request.PositionX,

            PositionY =
                request.PositionY
        };

        await _slotRepository.AddAsync(
            slot,
            cancellationToken);

        await _slotRepository.SaveChangesAsync(
            cancellationToken);

        var created =
            await _slotRepository.GetByIdAsync(
                slot.Id,
                cancellationToken);

        return created!.ToDto();
    }

    public async Task<ParkingSlotDto>
        UpdateSlotAsync(
            int slotId,
            UpdateParkingSlotRequestDto request,
            CancellationToken cancellationToken = default)
    {
        var slot =
            await _slotRepository.GetByIdAsync(
                slotId,
                cancellationToken);

        if (slot is null)
        {
            throw new KeyNotFoundException(
                "Parking slot was not found.");
        }

        if (slot.Status !=
            ParkingStatus.Available)
        {
            throw new InvalidOperationException(
                "Held or occupied parking slots cannot be edited.");
        }

        var zone =
            await _zoneRepository.GetByIdAsync(
                request.ParkingZoneId,
                cancellationToken);

        if (zone is null ||
            zone.EventId != slot.EventId)
        {
            throw new ArgumentException(
                "The parking zone is invalid.");
        }

        var slotCode =
            ParkingValidator
                .NormalizeSlotCode(
                    request.SlotCode);

        var exists =
            await _slotRepository
                .SlotCodeExistsAsync(
                    slot.EventId,
                    slotCode,
                    slot.Id,
                    cancellationToken);

        if (exists)
        {
            throw new InvalidOperationException(
                "Another parking slot already uses this code.");
        }

        slot.ParkingZoneId =
            request.ParkingZoneId;

        slot.SlotCode = slotCode;

        slot.DisplayOrder =
            request.DisplayOrder;

        slot.PositionX =
            request.PositionX;

        slot.PositionY =
            request.PositionY;

        await _slotRepository.SaveChangesAsync(
            cancellationToken);

        var updated =
            await _slotRepository.GetByIdAsync(
                slot.Id,
                cancellationToken);

        return updated!.ToDto();
    }

    public async Task DeleteSlotAsync(
        int slotId,
        CancellationToken cancellationToken = default)
    {
        var slot =
            await _slotRepository.GetByIdAsync(
                slotId,
                cancellationToken);

        if (slot is null)
        {
            throw new KeyNotFoundException(
                "Parking slot was not found.");
        }

        if (slot.Status !=
            ParkingStatus.Available)
        {
            throw new InvalidOperationException(
                "Held or occupied parking slots cannot be deleted.");
        }

        _slotRepository.Remove(slot);

        await _slotRepository.SaveChangesAsync(
            cancellationToken);
    }

    public async Task<ParkingReserveResult>
        ReserveParkingAsync(
            int bookingId,
            int customerId,
            ReserveParkingRequest request,
            CancellationToken cancellationToken = default)
    {
        ParkingValidator
            .ValidateReserveRequest(
                request);

        var booking =
             await _bookingRepository
              .GetByIdAsync(bookingId);

        if (booking is null)
        {
            throw new KeyNotFoundException(
                "Booking was not found.");
        }

        if (booking.CustomerId != customerId)
        {
            throw new UnauthorizedAccessException(
                "You cannot modify another customer's booking.");
        }

        if (booking.BookingStatus != BookingStatus.Pending)
        {
            throw new InvalidOperationException(
                "Parking may only be added to a pending booking.");
        }

        var slot =
            await _slotRepository.GetByIdAsync(
                request.ParkingSlotId,
                cancellationToken);

        if (slot is null)
        {
            throw new KeyNotFoundException(
                "Parking slot was not found.");
        }

        if (slot.EventId != booking.EventId)
        {
            throw new InvalidOperationException(
                "The parking slot does not belong to the booking event.");
        }

        if (!slot.ParkingZone
            .IsOnlineBookable)
        {
            throw new InvalidOperationException(
                "This parking zone is not available for online booking.");
        }

        await using var transaction =
            await _context.Database
                .BeginTransactionAsync(
                    IsolationLevel.Serializable,
                    cancellationToken);

        var existing =
            await _reservationRepository
                .GetByBookingIdAsync(
                    bookingId,
                    cancellationToken);

        if (existing is not null)
        {
            await transaction.RollbackAsync(
                cancellationToken);

            return new ParkingReserveResult(
                false,
                "This booking already has a parking reservation.",
                existing.ParkingSlotId);
        }

        var changed =
            await _slotRepository
                .TryChangeStatusAsync(
                    slot.Id,
                    ParkingStatus.Available,
                    ParkingStatus.Held,
                    cancellationToken);

        if (changed != 1)
        {
            await transaction.RollbackAsync(
                cancellationToken);

            return new ParkingReserveResult(
                false,
                "The parking slot was taken by another customer.",
                slot.Id);
        }

        var reservation =
            new ParkingReservation
            {
                BookingId = bookingId,

                ParkingSlotId =
                    slot.Id,

                FeeSnapshot =
                    slot.ParkingZone.Fee,

                VehicleTypeSnapshot =
                    slot.ParkingZone.VehicleType,

                ZoneNameSnapshot =
                    slot.ParkingZone.Name,

                ReservedAtUtc =
                    DateTime.UtcNow
            };

        await _reservationRepository
            .AddAsync(
                reservation,
                cancellationToken);

        await _context.SaveChangesAsync(
            cancellationToken);

        await transaction.CommitAsync(
            cancellationToken);

        return new ParkingReserveResult(
            true,
            "Parking slot held successfully.",
            null);
    }

    public async Task RemoveParkingAsync(
        int bookingId,
        int customerId,
        CancellationToken cancellationToken = default)
    {
        var booking =
            await _bookingRepository
                .GetByIdAsync(bookingId);

        if (booking is null)
        {
            throw new KeyNotFoundException(
                "Booking was not found.");
        }

        if (booking.CustomerId != customerId)
        {
            throw new UnauthorizedAccessException(
                "You cannot modify another customer's booking.");
        }

        if (booking.BookingStatus != BookingStatus.Pending)
        {
            throw new InvalidOperationException(
                "Parking can only be removed from a pending booking.");
        }

        var reservation =
            await _reservationRepository
                .GetByBookingIdAsync(
                    bookingId,
                    cancellationToken);

        if (reservation is null)
        {
            return;
        }

        await using var transaction =
            await _context.Database
                .BeginTransactionAsync(
                    cancellationToken);

        await _slotRepository
            .TryChangeStatusAsync(
                reservation.ParkingSlotId,
                ParkingStatus.Held,
                ParkingStatus.Available,
                cancellationToken);

        _reservationRepository.Remove(
            reservation);

        await _context.SaveChangesAsync(
            cancellationToken);

        await transaction.CommitAsync(
            cancellationToken);
    }

    public async Task ConfirmParkingForBookingAsync(
        int bookingId,
        CancellationToken cancellationToken = default)
    {
        var reservation =
            await _reservationRepository
                .GetByBookingIdAsync(
                    bookingId,
                    cancellationToken);

        if (reservation is null)
        {
            return;
        }

        await _slotRepository
            .TryChangeStatusAsync(
                reservation.ParkingSlotId,
                ParkingStatus.Held,
                ParkingStatus.Occupied,
                cancellationToken);
    }

    public async Task ReleaseParkingForBookingAsync(
        int bookingId,
        CancellationToken cancellationToken = default)
    {
        var reservation =
            await _reservationRepository
                .GetByBookingIdAsync(
                    bookingId,
                    cancellationToken);

        if (reservation is null)
        {
            return;
        }

        await _slotRepository
            .TryChangeStatusAsync(
                reservation.ParkingSlotId,
                ParkingStatus.Held,
                ParkingStatus.Available,
                cancellationToken);

        await _slotRepository
            .TryChangeStatusAsync(
                reservation.ParkingSlotId,
                ParkingStatus.Occupied,
                ParkingStatus.Available,
                cancellationToken);
    }
}