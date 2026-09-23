using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

namespace EventParkingReservationSystem.API.Common.Exceptions;

public static class DatabaseExceptionHelper
{
    public static bool IsUniqueConstraintViolation(DbUpdateException ex)
    {
        if (ex.InnerException is SqlException sqlEx)
        {
            return sqlEx.Number == 2601 || sqlEx.Number == 2627;
        }

        return ex.InnerException?.Message.Contains("UNIQUE KEY constraint", StringComparison.OrdinalIgnoreCase) == true
            || ex.InnerException?.Message.Contains("Cannot insert duplicate key", StringComparison.OrdinalIgnoreCase) == true;
    }
}
