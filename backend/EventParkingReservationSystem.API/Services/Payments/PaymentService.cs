using EventParkingReservationSystem.API.Enums.Bookings;
using EventParkingReservationSystem.API.Enums.Payments;

using EventParkingReservationSystem.API.Interfaces.Repositories.Bookings;
using EventParkingReservationSystem.API.Interfaces.Repositories.Customers;
using EventParkingReservationSystem.API.Interfaces.Repositories.Events;
using EventParkingReservationSystem.API.Interfaces.Repositories.Parking;
using EventParkingReservationSystem.API.Interfaces.Repositories.Payments;
using EventParkingReservationSystem.API.Interfaces.Repositories.Venues;

using EventParkingReservationSystem.API.Interfaces.Services.Bookings;
using EventParkingReservationSystem.API.Interfaces.Services.Notifications;
using EventParkingReservationSystem.API.Interfaces.Services.Payments;

using EventParkingReservationSystem.API.Mappings.Payments;

using EventParkingReservationSystem.API.Models.DTOs.Bookings;
using EventParkingReservationSystem.API.Models.DTOs.Payments;
using EventParkingReservationSystem.API.Models.Entities.Payments;

using EventParkingReservationSystem.API.Validators.Payments;

using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Services.Payments
{
    public class PaymentService : IPaymentService
    {
        private readonly IPaymentRepository _paymentRepository;
        private readonly IBookingRepository _bookingRepository;
        private readonly IBookingService _bookingService;
        private readonly IParkingReservationRepository _parkingReservationRepository;
        private readonly ICustomerRepository _customerRepository;
        private readonly IEventRepository _eventRepository;
        private readonly IVenueRepository _venueRepository;
        private readonly INotificationService _notificationService;
        private readonly ILogger<PaymentService> _logger;

        public PaymentService(
            IPaymentRepository paymentRepository,
            IBookingRepository bookingRepository,
            IBookingService bookingService,
            IParkingReservationRepository parkingReservationRepository,
            ICustomerRepository customerRepository,
            IEventRepository eventRepository,
            IVenueRepository venueRepository,
            INotificationService notificationService,
            ILogger<PaymentService> logger)
        {
            _paymentRepository = paymentRepository;
            _bookingRepository = bookingRepository;
            _bookingService = bookingService;
            _parkingReservationRepository = parkingReservationRepository;
            _customerRepository = customerRepository;
            _eventRepository = eventRepository;
            _venueRepository = venueRepository;
            _notificationService = notificationService;
            _logger = logger;
        }

        public async Task<BookingPaymentDto?> GetBookingPaymentAsync(
            int bookingId,
            int customerId)
        {
            var booking =
                await _bookingRepository.GetByIdAsync(bookingId);

            if (booking == null)
            {
                return null;
            }

            if (booking.CustomerId != customerId)
            {
                return null;
            }

            var payment =
                await _paymentRepository
                    .GetByBookingIdAsync(bookingId);

            var seatAmount =
                await _paymentRepository
                    .GetSeatAmountForBookingAsync(bookingId);

            var parkingReservation =
                await _parkingReservationRepository
                    .GetByBookingIdAsync(bookingId);

            var parkingAmount =
                parkingReservation?.FeeSnapshot ?? 0m;

            var calculatedTotal =
                seatAmount + parkingAmount;

            return booking.ToBookingPaymentDto(
                payment,
                calculatedTotal);
        }

        public async Task<PaymentResultDto> ProcessPaymentAsync(
            int bookingId,
            int customerId,
            ProcessPaymentRequestDto request)
        {
            ArgumentNullException.ThrowIfNull(request);

            var booking =
                await _bookingRepository.GetByIdAsync(bookingId);

            if (booking == null)
            {
                throw new KeyNotFoundException(
                    "Booking was not found.");
            }

            if (booking.CustomerId != customerId)
            {
                throw new UnauthorizedAccessException(
                    "You are not allowed to pay for this booking.");
            }

            if (booking.BookingStatus ==
                BookingStatus.Cancelled)
            {
                throw new InvalidOperationException(
                    "A cancelled booking cannot be paid.");
            }

            if (booking.BookingStatus ==
                BookingStatus.Expired)
            {
                throw new InvalidOperationException(
                    "An expired booking cannot be paid.");
            }

            if (booking.BookingStatus !=
                BookingStatus.Pending)
            {
                throw new InvalidOperationException(
                    "Only pending bookings can be paid.");
            }

            if (booking.HoldExpiresAtUtc <= DateTime.UtcNow)
            {
                throw new InvalidOperationException(
                    "The booking hold has expired.");
            }

            var paymentAlreadyExists =
                await _paymentRepository
                    .ExistsForBookingAsync(bookingId);

            if (paymentAlreadyExists)
            {
                throw new InvalidOperationException(
                    "A payment has already been recorded for this booking.");
            }

            ValidatePaymentRequest(request);

            var seatAmount =
                await _paymentRepository
                    .GetSeatAmountForBookingAsync(bookingId);

            if (seatAmount <= 0)
            {
                throw new InvalidOperationException(
                    "The booking does not contain any payable seats.");
            }

            var parkingReservation =
                await _parkingReservationRepository
                    .GetByBookingIdAsync(bookingId);

            var parkingAmount =
                parkingReservation?.FeeSnapshot ?? 0m;

            var totalAmount =
                seatAmount + parkingAmount;

            var paidAtUtc =
                DateTime.UtcNow;

            var payment = new Payment
            {
                BookingId = booking.BookingId,
                Amount = totalAmount,
                Currency = "LKR",
                PaymentMethod = request.PaymentMethod,
                Status = PaymentStatus.Completed,
                PaidAtUtc = paidAtUtc,
                CreatedAtUtc = paidAtUtc
            };

            await _paymentRepository
                .AddAsync(payment);

            BookingDto confirmedBooking;

            try
            {
                confirmedBooking =
                    await _bookingService
                        .ConfirmAfterPaymentAsync(bookingId);

                await _paymentRepository
                    .SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                throw new InvalidOperationException(
                    "The payment could not be recorded. " +
                    "A payment may already exist for this booking.",
                    ex);
            }

            try
            {
                await _notificationService
                    .CreateNotificationAsync(
                        customerId,
                        "Payment completed",
                        $"Payment for booking " +
                        $"{booking.BookingNumber} was completed successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogWarning(
                    ex,
                    "Payment {PaymentId} completed, but the payment " +
                    "notification could not be created.",
                    payment.PaymentId);
            }

            /*
             * Synchronize the booking entity status with the
             * result returned by BookingService before mapping.
             */
            booking.BookingStatus =
                confirmedBooking.BookingStatus;

            return payment.ToResultDto(
                booking,
                "Payment completed successfully.");
        }

        public async Task<IEnumerable<PaymentHistoryDto>>
            GetCustomerPaymentHistoryAsync(
                int customerId)
        {
            var payments =
                await _paymentRepository
                    .GetByCustomerIdAsync(customerId);

            var result =
                new List<PaymentHistoryDto>();

            foreach (var payment in payments)
            {
                var historyItem =
                    await BuildPaymentHistoryDtoAsync(payment);

                if (historyItem != null)
                {
                    result.Add(historyItem);
                }
            }

            return result;
        }

        public async Task<PaymentReceiptDto?> GetReceiptAsync(
            int paymentId,
            int customerId)
        {
            var payment =
                await _paymentRepository
                    .GetByIdAsync(paymentId);

            if (payment == null)
            {
                return null;
            }

            if (payment.Status !=
                PaymentStatus.Completed)
            {
                return null;
            }

            var booking =
                await _bookingRepository
                    .GetByIdAsync(payment.BookingId);

            if (booking == null)
            {
                return null;
            }

            if (booking.CustomerId != customerId)
            {
                return null;
            }

            var customer =
                await _customerRepository
                    .GetByIdAsync(customerId);

            if (customer == null)
            {
                return null;
            }

            var eventEntity =
                await _eventRepository
                    .GetByIdAsync(booking.EventId);

            if (eventEntity == null)
            {
                return null;
            }

            var venue =
                await _venueRepository
                    .GetByIdAsync(eventEntity.VenueId);

            var seatAmount =
                await _paymentRepository
                    .GetSeatAmountForBookingAsync(
                        booking.BookingId);

            var parkingReservation =
                await _parkingReservationRepository
                    .GetByBookingIdAsync(
                        booking.BookingId);

            var parkingAmount =
                parkingReservation?.FeeSnapshot ?? 0m;

            var eventDateTime =
                eventEntity.EventDate.ToDateTime(
                    eventEntity.StartTime);

            var customerName =
                $"{customer.FirstName} {customer.LastName}".Trim();

            return payment.ToReceiptDto(
                booking.BookingNumber,
                customerName,
                eventEntity.Name,
                eventDateTime,
                venue?.Name ?? string.Empty,
                seatAmount,
                parkingAmount);
        }

        public async Task<IEnumerable<PaymentHistoryDto>>
            GetAllPaymentsAsync()
        {
            var payments =
                await _paymentRepository
                    .GetAllAsync();

            var result =
                new List<PaymentHistoryDto>();

            foreach (var payment in payments)
            {
                var historyItem =
                    await BuildPaymentHistoryDtoAsync(payment);

                if (historyItem != null)
                {
                    result.Add(historyItem);
                }
            }

            return result;
        }

        private async Task<PaymentHistoryDto?>
            BuildPaymentHistoryDtoAsync(
                Payment payment)
        {
            var booking =
                await _bookingRepository
                    .GetByIdAsync(payment.BookingId);

            if (booking == null)
            {
                return null;
            }

            var eventEntity =
                await _eventRepository
                    .GetByIdAsync(booking.EventId);

            return payment.ToHistoryDto(
                booking.BookingNumber,
                eventEntity?.Name ?? string.Empty);
        }

        private static void ValidatePaymentRequest(
            ProcessPaymentRequestDto request)
        {
            if (!Enum.IsDefined(
                    typeof(PaymentMethod),
                    request.PaymentMethod))
            {
                throw new ArgumentException(
                    "Invalid payment method.",
                    nameof(request.PaymentMethod));
            }

            if (request.PaymentMethod !=
                PaymentMethod.Card)
            {
                return;
            }

            if (string.IsNullOrWhiteSpace(
                    request.CardholderName))
            {
                throw new ArgumentException(
                    "Cardholder name is required for card payments.",
                    nameof(request.CardholderName));
            }

            if (!PaymentCardValidator
                    .IsValidCardNumber(
                        request.TestCardNumber))
            {
                throw new ArgumentException(
                    "The simulated card number is invalid.",
                    nameof(request.TestCardNumber));
            }

            if (!PaymentCardValidator
                    .IsValidCvv(
                        request.TestCvv))
            {
                throw new ArgumentException(
                    "The simulated CVV is invalid.",
                    nameof(request.TestCvv));
            }

            if (!PaymentCardValidator
                    .IsValidExpiryFormat(
                        request.Expiry))
            {
                throw new ArgumentException(
                    "Expiry must use MM/YY format.",
                    nameof(request.Expiry));
            }

            if (!PaymentCardValidator
                    .IsExpiryInFuture(
                        request.Expiry))
            {
                throw new ArgumentException(
                    "The simulated card has expired.",
                    nameof(request.Expiry));
            }
        }
    }
}