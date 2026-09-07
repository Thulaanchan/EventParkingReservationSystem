using EventParkingReservationSystem.API.Models.DTOs.Parking;
using EventParkingReservationSystem.API.Models.Entities.Parking;

namespace EventParkingReservationSystem.API.Mappings.Parking;

public static class ParkingMappingProfile
{
    public static ParkingSlotDto ToDto(
        this ParkingSlot slot)
    {
        return new ParkingSlotDto
        {
            Id = slot.Id,
            EventId = slot.EventId,
            ParkingZoneId = slot.ParkingZoneId,
            SlotCode = slot.SlotCode,

            Status = slot.Status.ToString(),

            ZoneName = slot.ParkingZone.Name,

            VehicleType =
                slot.ParkingZone.VehicleType.ToString(),

            Fee = slot.ParkingZone.Fee,

            IsOnlineBookable =
                slot.ParkingZone.IsOnlineBookable,

            DisplayOrder = slot.DisplayOrder,

            PositionX = slot.PositionX,
            PositionY = slot.PositionY
        };
    }

    public static ParkingAvailabilityDto
        ToAvailabilityDto(
            this ParkingSlot slot)
    {
        return new ParkingAvailabilityDto
        {
            Id = slot.Id,
            SlotCode = slot.SlotCode,
            Status = slot.Status.ToString(),

            ZoneId = slot.ParkingZoneId,
            ZoneName = slot.ParkingZone.Name,

            VehicleType =
                slot.ParkingZone.VehicleType.ToString(),

            Fee = slot.ParkingZone.Fee,

            IsOnlineBookable =
                slot.ParkingZone.IsOnlineBookable,

            PositionX = slot.PositionX,
            PositionY = slot.PositionY
        };
    }
}