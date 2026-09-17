using EventParkingReservationSystem.API.Models.Entities.Events;

namespace EventParkingReservationSystem.API.Data.Seed.Events;

public static class EventSeedData
{
    public static Event[] GetEvents() =>
    [
        new Event
        {
            Id = 1,
            Name = "Anirudh Live in Colombo 2026",
            Description = "Experience an electrifying evening with chartbuster hits and a spectacular live production featuring Anirudh Ravichander live in concert at Colombo's premier indoor stadium.",
            VenueId = 3,
            CategoryId = 2,
            EventDate = new DateOnly(2026, 10, 18),
            StartTime = new TimeOnly(20, 0),
            EndTime = new TimeOnly(23, 30),
            TicketPrice = 4500m,
            ChildDiscountPercent = 50m,
            Capacity = 5000,
            StageLayout = "Indoor Arena",
            PosterUrl = "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new Event
        {
            Id = 2,
            Name = "Rockstar Aniruth Musical Show - 2026",
            Description = "Get ready for an unforgettable night as Rockstar Aniruth takes the stage in 2026 with a power-packed live musical show! Experience chart-topping hits, stunning visuals, and an unmatched atmosphere that only a live concert can deliver.\n\nThis is a major live music event designed for a premium audience experience. Your booking includes access to the available Platinum, Gold, and Silver sections. VIP Pre-Reserved seats are not available for normal customer booking.",
            VenueId = 2,
            CategoryId = 2,
            EventDate = new DateOnly(2026, 9, 25),
            StartTime = new TimeOnly(12, 0),
            EndTime = new TimeOnly(16, 30),
            TicketPrice = 10000m,
            ChildDiscountPercent = 50m,
            Capacity = 624,
            StageLayout = "Circular Arena",
            PosterUrl = "https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new Event
        {
            Id = 3,
            Name = "Sri Lanka vs India T20 Showdown",
            Description = "The ultimate cricket rivalry reignites under the stadium floodlights. Watch the giants battle in an epic high-stakes T20 international encounter with world-class seating and hospitality.",
            VenueId = 3,
            CategoryId = 3,
            EventDate = new DateOnly(2026, 10, 28),
            StartTime = new TimeOnly(19, 0),
            EndTime = new TimeOnly(23, 0),
            TicketPrice = 3500m,
            ChildDiscountPercent = 50m,
            Capacity = 5000,
            StageLayout = "Stadium Seating",
            PosterUrl = "https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new Event
        {
            Id = 4,
            Name = "The Phantom of the Opera Musical",
            Description = "The legendary Broadway masterpiece arrives with full orchestral arrangements, magnificent sets, and transcendent vocal performances in Sri Lanka's finest auditorium.",
            VenueId = 4,
            CategoryId = 4,
            EventDate = new DateOnly(2026, 11, 5),
            StartTime = new TimeOnly(17, 0),
            EndTime = new TimeOnly(20, 30),
            TicketPrice = 7500m,
            ChildDiscountPercent = 40m,
            Capacity = 1288,
            StageLayout = "Proscenium Theatre",
            PosterUrl = "https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new Event
        {
            Id = 5,
            Name = "Global Tech Summit 2026",
            Description = "Connect with global tech leaders, keynote innovators, and developers shaping next-generation AI and cloud architecture. Three days of cutting-edge keynotes and technical workshops.",
            VenueId = 5,
            CategoryId = 5,
            EventDate = new DateOnly(2026, 10, 12),
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(17, 0),
            TicketPrice = 7950m,
            ChildDiscountPercent = 0m,
            Capacity = 2000,
            StageLayout = "Keynote Auditorium",
            PosterUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new Event
        {
            Id = 6,
            Name = "Sri Lanka Build Expo 2026",
            Description = "The premier construction, architecture, and engineering exhibition showcasing innovative green technologies, modern materials, and smart building solutions for South Asia.",
            VenueId = 5,
            CategoryId = 6,
            EventDate = new DateOnly(2026, 11, 8),
            StartTime = new TimeOnly(10, 0),
            EndTime = new TimeOnly(18, 0),
            TicketPrice = 1200m,
            ChildDiscountPercent = 50m,
            Capacity = 3000,
            StageLayout = "Exhibition Hall",
            PosterUrl = "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new Event
        {
            Id = 7,
            Name = "Creative Leaders Summit 2026",
            Description = "An inspiring gathering of visionaries, product strategists, and creative executives exploring design excellence, future-forward brand building, and storytelling.",
            VenueId = 6,
            CategoryId = 5,
            EventDate = new DateOnly(2026, 10, 24),
            StartTime = new TimeOnly(9, 0),
            EndTime = new TimeOnly(16, 30),
            TicketPrice = 1800m,
            ChildDiscountPercent = 0m,
            Capacity = 1500,
            StageLayout = "Grand Ballroom",
            PosterUrl = "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        },
        new Event
        {
            Id = 8,
            Name = "Tamil Cultural Night 2026",
            Description = "A celebration of traditional music, classical dance, and vibrant folk performances showcasing the timeless heritage and art of Northern Sri Lanka.",
            VenueId = 7,
            CategoryId = 2,
            EventDate = new DateOnly(2026, 11, 18),
            StartTime = new TimeOnly(18, 30),
            EndTime = new TimeOnly(21, 30),
            TicketPrice = 1000m,
            ChildDiscountPercent = 50m,
            Capacity = 1000,
            StageLayout = "Amphitheatre",
            PosterUrl = "https://images.unsplash.com/photo-1607998803461-4e9aef3be418?auto=format&fit=crop&w=1200&q=80",
            CreatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc),
            UpdatedAt = new DateTime(2026, 1, 1, 0, 0, 0, DateTimeKind.Utc)
        }
    ];
}