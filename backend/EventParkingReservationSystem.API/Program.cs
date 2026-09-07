using System.Text;

using EventParkingReservationSystem.API.Data.Context;

using EventParkingReservationSystem.API.Interfaces.Repositories.Bookings;
using EventParkingReservationSystem.API.Interfaces.Repositories.Customers;
using EventParkingReservationSystem.API.Interfaces.Repositories.Notifications;
using EventParkingReservationSystem.API.Interfaces.Repositories.Payments;

using EventParkingReservationSystem.API.Interfaces.Services.Auth;
using EventParkingReservationSystem.API.Interfaces.Services.Bookings;
using EventParkingReservationSystem.API.Interfaces.Services.Customers;
using EventParkingReservationSystem.API.Interfaces.Services.Email;
using EventParkingReservationSystem.API.Interfaces.Services.Notifications;

using EventParkingReservationSystem.API.Models.Entities.Customers;

using EventParkingReservationSystem.API.Repositories.Bookings;
using EventParkingReservationSystem.API.Repositories.Customers;
using EventParkingReservationSystem.API.Repositories.Notifications;
using EventParkingReservationSystem.API.Repositories.Payments;

using EventParkingReservationSystem.API.Services.Auth;
using EventParkingReservationSystem.API.Services.Bookings;
using EventParkingReservationSystem.API.Services.Customers;
using EventParkingReservationSystem.API.Services.Email;
using EventParkingReservationSystem.API.Services.Notifications;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi;

using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Models.DTOs.Parking;
using EventParkingReservationSystem.API.Models.DTOs.Seats;

using EventParkingReservationSystem.API.Interfaces.Repositories.Parking;
using EventParkingReservationSystem.API.Interfaces.Repositories.Seats;

using EventParkingReservationSystem.API.Interfaces.Services.Parking;
using EventParkingReservationSystem.API.Interfaces.Services.Seats;

using EventParkingReservationSystem.API.Repositories.Parking;
using EventParkingReservationSystem.API.Repositories.Seats;

using EventParkingReservationSystem.API.Services.Parking;
using EventParkingReservationSystem.API.Services.Seats;

using EventParkingReservationSystem.API.Configurations.Booking;
using EventParkingReservationSystem.API.Validators.Bookings;

var builder = WebApplication.CreateBuilder(args);

//
// Database
//
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString(
            "DefaultConnection")));

//
// Repositories
//
builder.Services.AddScoped<
    ICustomerRepository,
    CustomerRepository>();

builder.Services.AddScoped<
    IBookingRepository,
    BookingRepository>();

builder.Services.AddScoped<
    INotificationRepository,
    NotificationRepository>();

builder.Services.AddScoped<
    IPaymentRepository,
    PaymentRepository>();

//
// Customer services
//
builder.Services.AddScoped<
    ICustomerService,
    CustomerService>();

//
// Booking services
//
builder.Services.AddScoped<
    IBookingNumberGenerator,
    BookingNumberGenerator>();

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
builder.Services.AddControllers();

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
// HTTP request pipeline
//
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AngularDevClient");

app.UseAuthentication();

app.UseAuthorization();

app.MapControllers();

app.Run();