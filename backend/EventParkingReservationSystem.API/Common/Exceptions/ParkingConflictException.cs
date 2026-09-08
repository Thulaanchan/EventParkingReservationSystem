namespace EventParkingReservationSystem.API.Common.Exceptions;

public sealed class ParkingConflictException : Exception
{
    public int? ConflictingParkingSlotId { get; }

    public ParkingConflictException(
        string message,
        int? conflictingParkingSlotId = null)
        : base(message)
    {
        ConflictingParkingSlotId =
            conflictingParkingSlotId;
    }
}