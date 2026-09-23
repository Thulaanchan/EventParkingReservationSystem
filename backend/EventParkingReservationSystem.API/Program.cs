using System.Text;

using EventParkingReservationSystem.API.Configurations.Booking;
using EventParkingReservationSystem.API.Data.Context;

using EventParkingReservationSystem.API.Interfaces.Repositories.Bookings;
using EventParkingReservationSystem.API.Interfaces.Repositories.Categories;
using EventParkingReservationSystem.API.Interfaces.Repositories.Customers;
using EventParkingReservationSystem.API.Interfaces.Repositories.Dashboards;
using EventParkingReservationSystem.API.Interfaces.Repositories.Events;
using EventParkingReservationSystem.API.Interfaces.Repositories.Notifications;
using EventParkingReservationSystem.API.Interfaces.Repositories.Parking;
using EventParkingReservationSystem.API.Interfaces.Repositories.Payments;
using EventParkingReservationSystem.API.Interfaces.Repositories.Seats;
using EventParkingReservationSystem.API.Interfaces.Repositories.Venues;

using EventParkingReservationSystem.API.Interfaces.Services.Auth;
using EventParkingReservationSystem.API.Interfaces.Services.Bookings;
using EventParkingReservationSystem.API.Interfaces.Services.Categories;
using EventParkingReservationSystem.API.Interfaces.Services.Customers;
using EventParkingReservationSystem.API.Interfaces.Services.Dashboards;
using EventParkingReservationSystem.API.Interfaces.Services.Email;
using EventParkingReservationSystem.API.Interfaces.Services.Events;
using EventParkingReservationSystem.API.Interfaces.Services.Notifications;
using EventParkingReservationSystem.API.Interfaces.Services.Parking;
using EventParkingReservationSystem.API.Interfaces.Services.Payments;
using EventParkingReservationSystem.API.Interfaces.Services.Seats;
using EventParkingReservationSystem.API.Interfaces.Services.Venues;

using EventParkingReservationSystem.API.Models.Entities.Customers;

using EventParkingReservationSystem.API.Repositories.Bookings;
using EventParkingReservationSystem.API.Repositories.Categories;
using EventParkingReservationSystem.API.Repositories.Customers;
using EventParkingReservationSystem.API.Repositories.Dashboards;
using EventParkingReservationSystem.API.Repositories.Events;
using EventParkingReservationSystem.API.Repositories.Notifications;
using EventParkingReservationSystem.API.Repositories.Parking;
using EventParkingReservationSystem.API.Repositories.Payments;
using EventParkingReservationSystem.API.Repositories.Seats;
using EventParkingReservationSystem.API.Repositories.Venues;

using EventParkingReservationSystem.API.Services.Auth;
using EventParkingReservationSystem.API.Services.Bookings;
using EventParkingReservationSystem.API.Services.Categories;
using EventParkingReservationSystem.API.Services.Customers;
using EventParkingReservationSystem.API.Services.Dashboards;
using EventParkingReservationSystem.API.Services.Email;
using EventParkingReservationSystem.API.Services.Events;
using EventParkingReservationSystem.API.Services.Notifications;
using EventParkingReservationSystem.API.Services.Parking;
using EventParkingReservationSystem.API.Services.Payments;
using EventParkingReservationSystem.API.Services.Seats;
using EventParkingReservationSystem.API.Services.Venues;

using EventParkingReservationSystem.API.Validators.Bookings;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

var builder = WebApplication.CreateBuilder(args);

//
// Database
//
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "DefaultConnection")));

//
// Shared infrastructure
//
builder.Services.AddMemoryCache();

//
// Repositories
//

// Customer
builder.Services.AddScoped<
    ICustomerRepository,
    CustomerRepository>();

// Booking
builder.Services.AddScoped<
    IBookingRepository,
    BookingRepository>();

// Category
builder.Services.AddScoped<
    ICategoryRepository,
    CategoryRepository>();

// Venue
builder.Services.AddScoped<
    IVenueRepository,
    VenueRepository>();

// Event
builder.Services.AddScoped<
    IEventRepository,
    EventRepository>();

// Seat
builder.Services.AddScoped<
    ISeatRepository,
    SeatRepository>();

builder.Services.AddScoped<
    ISeatSectionRepository,
    SeatSectionRepository>();

builder.Services.AddScoped<
    IEventSeatCategoryRepository,
    EventSeatCategoryRepository>();

// Parking
builder.Services.AddScoped<
    IParkingSlotRepository,
    ParkingSlotRepository>();

builder.Services.AddScoped<
    IParkingZoneRepository,
    ParkingZoneRepository>();

builder.Services.AddScoped<
    IParkingReservationRepository,
    ParkingReservationRepository>();

// Payment
builder.Services.AddScoped<
    IPaymentRepository,
    PaymentRepository>();

// Notification
builder.Services.AddScoped<
    INotificationRepository,
    NotificationRepository>();

// Admin Dashboard
builder.Services.AddScoped<
    IAdminDashboardRepository,
    AdminDashboardRepository>();

// Customer Dashboard
builder.Services.AddScoped<
    ICustomerDashboardRepository,
    CustomerDashboardRepository>();

//
// Customer services
//
builder.Services.AddScoped<
    ICustomerService,
    CustomerService>();

//
// Category services
//
builder.Services.AddScoped<
    ICategoryService,
    CategoryService>();

//
// Venue services
//
builder.Services.AddScoped<
    IVenueService,
    VenueService>();

//
// Event services
//
builder.Services.AddSingleton<
    IEventPosterStorage,
    LocalEventPosterStorage>();

builder.Services.AddScoped<
    IEventService,
    EventService>();

//
// Seat services
//
builder.Services.AddScoped<
    ISeatService,
    SeatService>();

//
// Parking services
//
builder.Services.AddScoped<
    IParkingService,
    ParkingService>();

builder.Services.AddScoped<
    IParkingZoneService,
    ParkingZoneService>();

//
// Booking services
//
builder.Services.AddScoped<
    IBookingNumberGenerator,
    BookingNumberGenerator>();

builder.Services.AddScoped<
    IBookingService,
    BookingService>();

//
// Booking expiry background worker
//
builder.Services.AddHostedService<
    BookingExpiryWorker>();

//
// Payment services
//
builder.Services.AddScoped<
    IPaymentService,
    PaymentService>();

//
// Booking configuration
//
builder.Services
    .AddOptions<BookingHoldOptions>()
    .Bind(
        builder.Configuration.GetSection(
            BookingHoldOptions.SectionName))
    .ValidateOnStart();

builder.Services.AddSingleton<
    Microsoft.Extensions.Options.IValidateOptions<BookingHoldOptions>,
    BookingHoldOptionsValidator>();

//
// Notification services
//
builder.Services.AddScoped<
    INotificationService,
    NotificationService>();

//
// Admin Dashboard services
//
builder.Services.AddScoped<
    IAdminDashboardService,
    AdminDashboardService>();

//
// Customer Dashboard services
//
builder.Services.AddScoped<
    ICustomerDashboardService,
    CustomerDashboardService>();

//
// Authentication services
//
builder.Services.AddScoped<
    IAuthService,
    AuthService>();

builder.Services.AddScoped<
    IJwtTokenService,
    JwtTokenService>();

builder.Services.AddScoped<
    IEmailService,
    EmailService>();

//
// Password hashing
//
builder.Services.AddScoped<
    IPasswordHasher<Customer>,
    PasswordHasher<Customer>>();

//
// JWT Authentication
//
var jwtKey =
    builder.Configuration["Jwt:Key"]
    ?? throw new InvalidOperationException(
        "JWT signing key is not configured.");

var jwtIssuer =
    builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException(
        "JWT issuer is not configured.");

var jwtAudience =
    builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException(
        "JWT audience is not configured.");

builder.Services
    .AddAuthentication(options =>
    {
        options.DefaultAuthenticateScheme =
            JwtBearerDefaults.AuthenticationScheme;

        options.DefaultChallengeScheme =
            JwtBearerDefaults.AuthenticationScheme;
    })
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters =
            new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = jwtIssuer,

                ValidateAudience = true,
                ValidAudience = jwtAudience,

                ValidateIssuerSigningKey = true,

                IssuerSigningKey =
                    new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(jwtKey)),

                ValidateLifetime = true,

                ClockSkew = TimeSpan.Zero
            };

        options.Events = new JwtBearerEvents
        {
            OnAuthenticationFailed = context =>
            {
                Console.WriteLine($"[JWT AUTH FAILED] {context.Exception.GetType().Name}: {context.Exception.Message}");
                return Task.CompletedTask;
            },
            OnChallenge = context =>
            {
                Console.WriteLine($"[JWT CHALLENGE] Error: {context.Error}, Description: {context.ErrorDescription}");
                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

//
// Angular CORS
//
builder.Services.AddCors(options =>
{
    options.AddPolicy(
        "AngularDevClient",
        policy =>
        {
            policy
                .WithOrigins("http://localhost:4200")
                .AllowAnyHeader()
                .AllowAnyMethod();
        });
});

//
// Controllers
//
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler =
            System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
    });

//
// Swagger / OpenAPI
//
builder.Services.AddSwaggerGen(options =>
{
    options.AddSecurityDefinition(
        "Bearer",
        new OpenApiSecurityScheme
        {
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT",
            Description =
                "Enter the JWT access token."
        });

    options.AddSecurityRequirement(
        document =>
            new OpenApiSecurityRequirement
            {
                [
                    new OpenApiSecuritySchemeReference(
                        "Bearer",
                        document)
                ] = []
            });
});

var app = builder.Build();

//
// Database schema initialization
//
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
        db.Database.ExecuteSqlRaw(@"
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
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogWarning(ex, "Could not verify or create RefreshTokens table. Continuing with startup.");
    }
}

//
// HTTP request pipeline
//
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();

    app.Lifetime.ApplicationStarted.Register(() =>
    {
        try
        {
            var frontendUrl = app.Configuration["Frontend:BaseUrl"] ?? "http://localhost:4200/";
            if (!frontendUrl.EndsWith("/"))
            {
                frontendUrl += "/";
            }

            // Check if frontend server is already responding on port 4200
            var isFrontendRunning = false;
            try
            {
                using var tcp = new System.Net.Sockets.TcpClient();
                var asyncResult = tcp.BeginConnect("127.0.0.1", 4200, null, null);
                isFrontendRunning = asyncResult.AsyncWaitHandle.WaitOne(TimeSpan.FromMilliseconds(500));
                if (isFrontendRunning)
                {
                    tcp.EndConnect(asyncResult);
                }
            }
            catch
            {
                isFrontendRunning = false;
            }

            // If not running, launch 'npm start' in the frontend directory
            if (!isFrontendRunning)
            {
                var frontendDir = Path.GetFullPath(Path.Combine(app.Environment.ContentRootPath, "..", "..", "frontend", "BookWithUs"));
                if (Directory.Exists(frontendDir))
                {
                    System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
                    {
                        FileName = "cmd.exe",
                        Arguments = "/c start \"BookWithUs Frontend (Angular)\" cmd /k \"npm start\"",
                        WorkingDirectory = frontendDir,
                        UseShellExecute = true
                    });
                }
            }

            // Launch browser to frontend URL
            System.Diagnostics.Process.Start(new System.Diagnostics.ProcessStartInfo
            {
                FileName = frontendUrl,
                UseShellExecute = true
            });
        }
        catch
        {
            // Silently ignore if running in a headless or non-desktop environment
        }
    });
}

app.UseCors("AngularDevClient");

app.UseHttpsRedirection();

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();