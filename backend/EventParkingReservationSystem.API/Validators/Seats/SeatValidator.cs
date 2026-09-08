using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Models.DTOs.Seats;

namespace EventParkingReservationSystem.API.Validators.Seats;

public static class SeatValidator
{
    public static void ValidateReserveRequest(
        ReserveSeatsRequest request)
    {
        // At least one seat is required.
        if (request.Seats is null ||
            request.Seats.Count == 0)
        {
            throw new ArgumentException(
                "At least one seat must be selected.");
        }

        // Every seat id must be valid.
        if (request.Seats.Any(
            seat => seat.SeatId <= 0))
        {
            throw new ArgumentException(
                "Every seat id must be valid.");
        }

        // Same seat cannot appear twice.
        var duplicateSeatIds =
            request.Seats
                .GroupBy(seat => seat.SeatId)
                .Where(group => group.Count() > 1)
                .Select(group => group.Key)
                .ToArray();

        if (duplicateSeatIds.Length > 0)
        {
            throw new ArgumentException(
                "The same seat cannot be selected more than once.");
        }

        // Every selected seat must have
        // an attendee name.
        if (request.Seats.Any(
            seat =>
                string.IsNullOrWhiteSpace(
                    seat.AttendeeName)))
        {
            throw new ArgumentException(
                "An attendee name is required for every selected seat.");
        }

        // Keep attendee names within the
        // DTO/database supported length.
        if (request.Seats.Any(
            seat =>
                seat.AttendeeName.Trim().Length > 100))
        {
            throw new ArgumentException(
                "Attendee name cannot exceed 100 characters.");
        }

        // AttendeeType must be a valid enum value.
        if (request.Seats.Any(
            seat =>
                !Enum.IsDefined(
                    typeof(AttendeeType),
                    seat.AttendeeType)))
        {
            throw new ArgumentException(
                "Every selected seat must have a valid attendee type.");
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