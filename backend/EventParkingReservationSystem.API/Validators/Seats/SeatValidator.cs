using EventParkingReservationSystem.API.Models.DTOs.Seats;

namespace EventParkingReservationSystem.API.Validators.Seats;

public static class SeatValidator
{
    public static void ValidateReserveRequest(ReserveSeatsRequest request)
    {
        if (request.SeatIds == null || request.SeatIds.Count == 0)
        {
            throw new ArgumentException(
                "At least one seat must be selected.");
        }

        if (request.SeatIds.Any(id => id <= 0))
        {
            throw new ArgumentException(
                "Every seat id must be greater than zero.");
        }

        if (request.SeatIds.Count != request.SeatIds.Distinct().Count())
        {
            throw new ArgumentException(
                "The same seat cannot be selected more than once.");
        }
    }

    public static string NormalizeRowLabel(string rowLabel)
    {
        return rowLabel.Trim().ToUpperInvariant();
    }
}