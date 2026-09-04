using System.ComponentModel.DataAnnotations;
using EventParkingReservationSystem.API.Enums.Payments;

namespace EventParkingReservationSystem.API.Models.DTOs.Payments
{
    public class ProcessPaymentRequestDto
    {
        [Required]
        public PaymentMethod PaymentMethod { get; set; }

        [MaxLength(100)]
        public string? CardholderName { get; set; }

        /*
         * SIMULATION VALUES ONLY.
         *
         * Never persist or log these values.
         * Angular must clearly tell the user to use test values.
         */
        [MaxLength(19)]
        public string? TestCardNumber { get; set; }

        [MaxLength(5)]
        public string? Expiry { get; set; }

        [MaxLength(3)]
        public string? TestCvv { get; set; }
    }
}