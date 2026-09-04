using System.ComponentModel.DataAnnotations;

namespace EventParkingReservationSystem.API.Models.DTOs.Parking;

public class ReserveParkingRequest
{
    [Range(1, int.MaxValue)]
    public int ParkingSlotId { get; set; }
}