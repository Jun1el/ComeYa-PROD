using ComeYa.Domain.Common;

namespace ComeYa.Domain.Entities;

public class Business : BaseEntity
{
    public Guid OwnerId { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Description { get; set; }
    public string District { get; set; } = string.Empty;
    public string? Address { get; set; }
    public string? Phone { get; set; }
    public string? LogoUrl { get; set; }
    public decimal Rating { get; set; } = 0;
    public int TotalRatings { get; set; } = 0;
    public bool IsActive { get; set; } = true;

    public Profile Owner { get; set; } = null!;
    public ICollection<Product> Products { get; set; } = new List<Product>();
    public ICollection<Order> Orders { get; set; } = new List<Order>();
}
