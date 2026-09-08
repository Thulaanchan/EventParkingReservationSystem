namespace EventParkingReservationSystem.API.Common.Exceptions;

public sealed class BookingConflictException : Exception
{
    public IReadOnlyList<int> ConflictingSeatIds { get; }

    public BookingConflictException(
        string message,
        IReadOnlyList<int>? conflictingSeatIds = null)
        : base(message)
    {
        ConflictingSeatIds =
            conflictingSeatIds ?? Array.Empty<int>();
    }
}