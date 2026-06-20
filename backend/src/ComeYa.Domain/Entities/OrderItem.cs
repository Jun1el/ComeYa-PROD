using ComeYa.Domain.Common;

namespace ComeYa.Domain.Entities;

public class OrderItem : BaseEntity
{
    public Guid OrderId { get; set; }
    public Guid ProductId { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal => Price * Quantity;

    public Order Order { get; set; } = null!;
    public Product Product { get; set; } = null!;
}
