using EventParkingReservationSystem.API.Models.DTOs.Seats;

namespace EventParkingReservationSystem.API.Validators.Seats;

public static class SeatValidator
{
    public static void ValidateReserveRequest(
        ReserveSeatsRequest request)
    {
        if (request.Seats is null ||
            request.Seats.Count == 0)
        {
            throw new ArgumentException(
                "At least one seat must be selected.");
        }

        if (request.Seats.Any(x => x.SeatId <= 0))
        {
            throw new ArgumentException(
                "Every seat id must be valid.");
        }

        var duplicateSeatIds =
            request.Seats
                .GroupBy(x => x.SeatId)
                .Where(x => x.Count() > 1)
                .Select(x => x.Key)
                .ToArray();

        if (duplicateSeatIds.Length > 0)
        {
            throw new ArgumentException(
                "The same seat cannot be selected more than once.");
        }
    }

    public static string NormalizeRowLabel(
        string rowLabel)
    {
        return rowLabel
            .Trim()
            .ToUpperInvariant();
    }

    public static string NormalizeCode(
        string code)
    {
        return code
            .Trim()
            .ToUpperInvariant();
    }
}