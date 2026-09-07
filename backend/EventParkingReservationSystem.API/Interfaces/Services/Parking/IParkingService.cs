using EventParkingReservationSystem.API.Models.DTOs.Parking;

namespace EventParkingReservationSystem.API.Interfaces.Services.Parking;

public interface IParkingService
{
    Task<IReadOnlyList<ParkingAvailabilityDto>>
        GetEventParkingAsync(
            int eventId,
            CancellationToken cancellationToken = default);

    Task<ParkingSlotDto> GetByIdAsync(
        int slotId,
        CancellationToken cancellationToken = default);

    Task<ParkingSlotDto> CreateSlotAsync(
        int eventId,
        CreateParkingSlotRequest request,
        CancellationToken cancellationToken = default);

    Task<ParkingSlotDto> UpdateSlotAsync(
        int slotId,
        UpdateParkingSlotRequestDto request,
        CancellationToken cancellationToken = default);

    Task DeleteSlotAsync(
        int slotId,
        CancellationToken cancellationToken = default);

    Task<ParkingReserveResult>
        ReserveParkingAsync(
            int bookingId,
            int customerId,
            ReserveParkingRequest request,
            CancellationToken cancellationToken = default);

    Task RemoveParkingAsync(
        int bookingId,
        int customerId,
        CancellationToken cancellationToken = default);

    Task ConfirmParkingForBookingAsync(
        int bookingId,
        CancellationToken cancellationToken = default);

    Task ReleaseParkingForBookingAsync(
        int bookingId,
        CancellationToken cancellationToken = default);
}

public record ParkingReserveResult(
    bool Success,
    string Message,
    int? ConflictingParkingSlotId);