using EventParkingReservationSystem.API.Models.DTOs.Seats;
using EventParkingReservationSystem.API.Models.Entities.Seats;

namespace EventParkingReservationSystem.API.Mappings.Seats;

public static class SeatMappingProfile
{
    public static SeatDto ToDto(
        this Seat seat,
        decimal childDiscountPercent)
    {
        var adultPrice = seat.Section.SeatCategory.AdultPrice;

        var childPrice =
            adultPrice *
            (1m - childDiscountPercent / 100m);

        return new SeatDto
        {
            Id = seat.Id,
            EventId = seat.EventId,
            SeatSectionId = seat.SeatSectionId,

            SeatCode = BuildSeatCode(seat),

            RowLabel = seat.RowLabel,
            Number = seat.Number,

            SectionCode = seat.Section.Code,
            SectionName = seat.Section.Name,

            CategoryCode =
                seat.Section.SeatCategory.Code,

            CategoryName =
                seat.Section.SeatCategory.Name,

            AdultPrice = adultPrice,
            ChildPrice = childPrice,

            IsPubliclyBookable =
                seat.Section
                    .SeatCategory
                    .IsPubliclyBookable,

            Status = seat.Status.ToString(),

            DisplayOrder = seat.DisplayOrder,

            PositionX = seat.PositionX,
            PositionY = seat.PositionY
        };
    }

    public static SeatAvailabilityDto ToAvailabilityDto(
        this Seat seat,
        decimal childDiscountPercent)
    {
        var adultPrice = seat.Section.SeatCategory.AdultPrice;

        var childPrice =
            adultPrice *
            (1m - childDiscountPercent / 100m);

        return new SeatAvailabilityDto
        {
            Id = seat.Id,

            SeatCode = BuildSeatCode(seat),

            RowLabel = seat.RowLabel,
            Number = seat.Number,

            SectionId = seat.SeatSectionId,

            SectionCode = seat.Section.Code,
            SectionName = seat.Section.Name,

            CategoryCode =
                seat.Section.SeatCategory.Code,

            CategoryName =
                seat.Section.SeatCategory.Name,

            AdultPrice = adultPrice,
            ChildPrice = childPrice,

            IsPubliclyBookable =
                seat.Section
                    .SeatCategory
                    .IsPubliclyBookable,

            Status = seat.Status.ToString(),

            PositionX = seat.PositionX,
            PositionY = seat.PositionY
        };
    }

    private static string BuildSeatCode(Seat seat)
    {
        return
            $"{seat.Section.SeatCategory.Code}-" +
            $"{seat.Section.Code}-" +
            $"{seat.Number:D2}";
    }
}