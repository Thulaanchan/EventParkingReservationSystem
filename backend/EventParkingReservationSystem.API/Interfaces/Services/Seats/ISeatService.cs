using EventParkingReservationSystem.API.Models.DTOs.Seats;

namespace EventParkingReservationSystem.API.Interfaces.Services.Seats;

public interface ISeatService
{
    Task<IReadOnlyList<SeatAvailabilityDto>>
        GetEventSeatsAsync(
            int eventId,
            CancellationToken cancellationToken = default);

    Task<SeatDto> GetByIdAsync(
        int seatId,
        CancellationToken cancellationToken = default);

    Task<SeatDto> CreateAsync(
        int eventId,
        CreateSeatRequest request,
        CancellationToken cancellationToken = default);

    Task<SeatDto> UpdateAsync(
        int seatId,
        UpdateSeatRequest request,
        CancellationToken cancellationToken = default);

    Task DeleteAsync(
        int seatId,
        CancellationToken cancellationToken = default);

    Task<SeatHoldResult> HoldSeatsForBookingAsync(
        int bookingId,
        int customerId,
        ReserveSeatsRequest request,
        CancellationToken cancellationToken = default);

    Task ConfirmSeatsForBookingAsync(
        int bookingId,
        CancellationToken cancellationToken = default);

    Task ReleaseSeatsForBookingAsync(
        int bookingId,
        CancellationToken cancellationToken = default);
}

public record SeatHoldResult(
    bool Success,
    string Message,
    IReadOnlyList<int> ConflictingSeatIds);