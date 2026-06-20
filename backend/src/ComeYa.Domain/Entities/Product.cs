using ComeYa.Domain.Common;
using ComeYa.Domain.Enums;

namespace ComeYa.Domain.Entities;

public class Product : BaseEntity
{
    public Guid BusinessId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public ProductCategory Category { get; set; }
    public decimal Price { get; set; }
    public decimal OriginalPrice { get; set; }
    public string? ImageUrl { get; set; }
    public int Stock { get; set; } = 1;
    public DateTime ExpiresAt { get; set; }
    public bool IsActive { get; set; } = true;

    public Business Business { get; set; } = null!;
    public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();

    public int DiscountPercentage => OriginalPrice > 0
        ? (int)Math.Round((1 - Price / OriginalPrice) * 100)
        : 0;

    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;

    public int HoursUntilExpiry => (int)Math.Ceiling((ExpiresAt - DateTime.UtcNow).TotalHours);
}
