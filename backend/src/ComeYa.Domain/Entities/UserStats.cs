namespace ComeYa.Domain.Entities;

public class UserStats
{
    public Guid UserId { get; set; }
    public int MealsRescued { get; set; }
    public decimal MoneySaved { get; set; }
    public decimal Co2Avoided { get; set; }
    public int TotalOrders { get; set; }
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Profile User { get; set; } = null!;
}
