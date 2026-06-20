using ComeYa.Domain.Common;
using ComeYa.Domain.Enums;

namespace ComeYa.Domain.Entities;

public class Order : BaseEntity
{
    public Guid CustomerId { get; set; }
    public Guid BusinessId { get; set; }
    public OrderStatus Status { get; set; } = OrderStatus.Pending;
    public decimal Subtotal { get; set; }
    public decimal ShippingCost { get; set; }
    public decimal Discount { get; set; }
    public string? CouponCode { get; set; }
    public decimal Total { get; set; }
    public PaymentMethod PaymentMethod { get; set; } = PaymentMethod.Cash;
    public string? DeliveryAddress { get; set; }
    public string? DeliveryDistrict { get; set; }
    public DateTime? EstimatedDelivery { get; set; }
    public DateTime? DeliveredAt { get; set; }
    public string? Notes { get; set; }

    public Profile Customer { get; set; } = null!;
    public Business Business { get; set; } = null!;
    public ICollection<OrderItem> Items { get; set; } = new List<OrderItem>();
    public ICollection<Message> Messages { get; set; } = new List<Message>();
    public Complaint? Complaint { get; set; }

    public bool CanBeCancelled => Status == OrderStatus.Pending;
    public bool IsDelivered => Status == OrderStatus.Delivered;
}
