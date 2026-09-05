using EventParkingReservationSystem.API.Data.Context;
using Microsoft.EntityFrameworkCore;

using EventParkingReservationSystem.API.Interfaces.Repositories.Customers;
using EventParkingReservationSystem.API.Repositories.Customers;
using Microsoft.AspNetCore.Identity;
using EventParkingReservationSystem.API.Models.Entities.Customers;
using EventParkingReservationSystem.API.Interfaces.Services.Customers;
using EventParkingReservationSystem.API.Services.Customers;

using EventParkingReservationSystem.API.Interfaces.Repositories.Notifications;
using EventParkingReservationSystem.API.Repositories.Notifications;
using EventParkingReservationSystem.API.Interfaces.Services.Notifications;
using EventParkingReservationSystem.API.Services.Notifications;

var builder = WebApplication.CreateBuilder(args);

// Database connection
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(
        builder.Configuration.GetConnectionString("DefaultConnection")));

// Customer dependencies
builder.Services.AddScoped<ICustomerRepository,
    CustomerRepository>();

builder.Services.AddScoped<IPasswordHasher<Customer>,
    PasswordHasher<Customer>>();

builder.Services.AddScoped<ICustomerService,
    CustomerService>();

// Notification dependencies
builder.Services.AddScoped<INotificationRepository,
    NotificationRepository>();

builder.Services.AddScoped<INotificationService,
    NotificationService>();

// Add services to the container
builder.Services.AddControllers();

// Swagger / OpenAPI
builder.Services.AddSwaggerGen();

var app = builder.Build();

// Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();

app.Run();