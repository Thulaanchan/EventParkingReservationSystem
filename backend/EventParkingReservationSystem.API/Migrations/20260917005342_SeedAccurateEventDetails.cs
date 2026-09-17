using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace EventParkingReservationSystem.API.Migrations
{
    /// <inheritdoc />
    public partial class SeedAccurateEventDetails : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AlterColumn<string>(
                name: "PosterUrl",
                table: "Events",
                type: "nvarchar(1000)",
                maxLength: 1000,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(500)",
                oldMaxLength: 500,
                oldNullable: true);

            // Ensure RefreshTokens table exists idempotently
            migrationBuilder.Sql(@"
                IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RefreshTokens')
                BEGIN
                    CREATE TABLE [RefreshTokens] (
                        [RefreshTokenId] int NOT NULL IDENTITY(1,1),
                        [CustomerId] int NOT NULL,
                        [TokenHash] nvarchar(128) NOT NULL,
                        [ExpiresAtUtc] datetime2 NOT NULL,
                        [CreatedAtUtc] datetime2 NOT NULL,
                        [CreatedByIp] nvarchar(50) NULL,
                        [RevokedAtUtc] datetime2 NULL,
                        [RevokedByIp] nvarchar(50) NULL,
                        [ReplacedByTokenHash] nvarchar(128) NULL,
                        [ReasonRevoked] nvarchar(250) NULL,
                        CONSTRAINT [PK_RefreshTokens] PRIMARY KEY ([RefreshTokenId]),
                        CONSTRAINT [FK_RefreshTokens_Customers_CustomerId] FOREIGN KEY ([CustomerId]) REFERENCES [Customers] ([CustomerId]) ON DELETE CASCADE
                    );
                    CREATE UNIQUE INDEX [IX_RefreshTokens_TokenHash] ON [RefreshTokens] ([TokenHash]);
                    CREATE INDEX [IX_RefreshTokens_CustomerId] ON [RefreshTokens] ([CustomerId]);
                END
            ");

            // Seed & update EventCategories
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT [EventCategories] ON;
                
                MERGE INTO [EventCategories] AS target
                USING (VALUES
                    (1, 'Concert', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (2, 'Concerts & Music', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (3, 'Sports & Fitness', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (4, 'Theatre & Arts', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (5, 'Conferences & Seminars', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (6, 'Expos & Trade Shows', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')
                ) AS source (Id, Name, CreatedAt, UpdatedAt)
                ON target.Id = source.Id
                WHEN MATCHED THEN
                    UPDATE SET target.Name = source.Name, target.UpdatedAt = GETUTCDATE()
                WHEN NOT MATCHED THEN
                    INSERT (Id, Name, CreatedAt, UpdatedAt)
                    VALUES (source.Id, source.Name, source.CreatedAt, source.UpdatedAt);

                SET IDENTITY_INSERT [EventCategories] OFF;
            ");

            // Seed & update Venues
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT [Venues] ON;

                MERGE INTO [Venues] AS target
                USING (VALUES
                    (1, 'EventFlow Main Hall', 'Colombo, Sri Lanka', 1500, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (2, 'Unicom TIC', 'A9 Road, Jaffna, Sri Lanka', 2500, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (3, 'Sugathadasa Indoor Stadium', 'Prince of Wales Ave, Colombo 14, Sri Lanka', 5000, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (4, 'Nelum Pokuna Mahinda Rajapaksa Theatre', '110 Ananda Coomaraswamy Mawatha, Colombo 07, Sri Lanka', 1288, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (5, 'BMICH, Colombo', 'Bauddhaloka Mawatha, Colombo 07, Sri Lanka', 3000, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (6, 'Cinnamon Life, Colombo', '1 Justice Akbar Mawatha, Colombo 02, Sri Lanka', 1500, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (7, 'Jaffna Cultural Centre', 'Mahatma Gandhi Road, Jaffna, Sri Lanka', 1000, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')
                ) AS source (Id, Name, Address, TotalCapacity, CreatedAt, UpdatedAt)
                ON target.Id = source.Id
                WHEN MATCHED THEN
                    UPDATE SET target.Name = source.Name, target.Address = source.Address, target.TotalCapacity = source.TotalCapacity, target.UpdatedAt = GETUTCDATE()
                WHEN NOT MATCHED THEN
                    INSERT (Id, Name, Address, TotalCapacity, CreatedAt, UpdatedAt)
                    VALUES (source.Id, source.Name, source.Address, source.TotalCapacity, source.CreatedAt, source.UpdatedAt);

                SET IDENTITY_INSERT [Venues] OFF;
            ");

            // Seed & update Events with accurate mock details
            migrationBuilder.Sql(@"
                SET IDENTITY_INSERT [Events] ON;

                MERGE INTO [Events] AS target
                USING (VALUES
                    (1, 'Anirudh Live in Colombo 2026', 'Experience an electrifying evening with chartbuster hits and a spectacular live production featuring Anirudh Ravichander live in concert at Colombo''s premier indoor stadium.', 3, 2, '2026-10-18', '20:00:00', '23:30:00', 4500.00, 50.00, 5000, 'Indoor Arena', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=80', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (2, 'Rockstar Aniruth Musical Show - 2026', 'Get ready for an unforgettable night as Rockstar Aniruth takes the stage in 2026 with a power-packed live musical show! Experience chart-topping hits, stunning visuals, and an unmatched atmosphere that only a live concert can deliver.

This is a major live music event designed for a premium audience experience. Your booking includes access to the available Platinum, Gold, and Silver sections. VIP Pre-Reserved seats are not available for normal customer booking.', 2, 2, '2026-09-25', '12:00:00', '16:30:00', 10000.00, 50.00, 624, 'Circular Arena', 'https://images.unsplash.com/photo-1540039155733-5bb30b53aa14?auto=format&fit=crop&w=1200&q=80', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (3, 'Sri Lanka vs India T20 Showdown', 'The ultimate cricket rivalry reignites under the stadium floodlights. Watch the giants battle in an epic high-stakes T20 international encounter with world-class seating and hospitality.', 3, 3, '2026-10-28', '19:00:00', '23:00:00', 3500.00, 50.00, 5000, 'Stadium Seating', 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (4, 'The Phantom of the Opera Musical', 'The legendary Broadway masterpiece arrives with full orchestral arrangements, magnificent sets, and transcendent vocal performances in Sri Lanka''s finest auditorium.', 4, 4, '2026-11-05', '17:00:00', '20:30:00', 7500.00, 40.00, 1288, 'Proscenium Theatre', 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?auto=format&fit=crop&w=1200&q=80', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (5, 'Global Tech Summit 2026', 'Connect with global tech leaders, keynote innovators, and developers shaping next-generation AI and cloud architecture. Three days of cutting-edge keynotes and technical workshops.', 5, 5, '2026-10-12', '09:00:00', '17:00:00', 7950.00, 0.00, 2000, 'Keynote Auditorium', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (6, 'Sri Lanka Build Expo 2026', 'The premier construction, architecture, and engineering exhibition showcasing innovative green technologies, modern materials, and smart building solutions for South Asia.', 5, 6, '2026-11-08', '10:00:00', '18:00:00', 1200.00, 50.00, 3000, 'Exhibition Hall', 'https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (7, 'Creative Leaders Summit 2026', 'An inspiring gathering of visionaries, product strategists, and creative executives exploring design excellence, future-forward brand building, and storytelling.', 6, 5, '2026-10-24', '09:00:00', '16:30:00', 1800.00, 0.00, 1500, 'Grand Ballroom', 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z'),
                    (8, 'Tamil Cultural Night 2026', 'A celebration of traditional music, classical dance, and vibrant folk performances showcasing the timeless heritage and art of Northern Sri Lanka.', 7, 2, '2026-11-18', '18:30:00', '21:30:00', 1000.00, 50.00, 1000, 'Amphitheatre', 'https://images.unsplash.com/photo-1607998803461-4e9aef3be418?auto=format&fit=crop&w=1200&q=80', '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z')
                ) AS source (Id, Name, Description, VenueId, CategoryId, EventDate, StartTime, EndTime, TicketPrice, ChildDiscountPercent, Capacity, StageLayout, PosterUrl, CreatedAt, UpdatedAt)
                ON target.Id = source.Id
                WHEN MATCHED THEN
                    UPDATE SET
                        target.Name = source.Name,
                        target.Description = source.Description,
                        target.VenueId = source.VenueId,
                        target.CategoryId = source.CategoryId,
                        target.EventDate = source.EventDate,
                        target.StartTime = source.StartTime,
                        target.EndTime = source.EndTime,
                        target.TicketPrice = source.TicketPrice,
                        target.ChildDiscountPercent = source.ChildDiscountPercent,
                        target.Capacity = source.Capacity,
                        target.StageLayout = source.StageLayout,
                        target.PosterUrl = source.PosterUrl,
                        target.UpdatedAt = GETUTCDATE()
                WHEN NOT MATCHED THEN
                    INSERT (Id, Name, Description, VenueId, CategoryId, EventDate, StartTime, EndTime, TicketPrice, ChildDiscountPercent, Capacity, StageLayout, PosterUrl, CreatedAt, UpdatedAt)
                    VALUES (source.Id, source.Name, source.Description, source.VenueId, source.CategoryId, source.EventDate, source.StartTime, source.EndTime, source.TicketPrice, source.ChildDiscountPercent, source.Capacity, source.StageLayout, source.PosterUrl, source.CreatedAt, source.UpdatedAt);

                SET IDENTITY_INSERT [Events] OFF;
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                DELETE FROM [Events] WHERE Id IN (5, 6, 7, 8);
                DELETE FROM [Venues] WHERE Id IN (5, 6, 7);
                DELETE FROM [EventCategories] WHERE Id = 6;
            ");

            migrationBuilder.AlterColumn<string>(
                name: "PosterUrl",
                table: "Events",
                type: "nvarchar(500)",
                maxLength: 500,
                nullable: true,
                oldClrType: typeof(string),
                oldType: "nvarchar(1000)",
                oldMaxLength: 1000,
                oldNullable: true);
        }
    }
}
