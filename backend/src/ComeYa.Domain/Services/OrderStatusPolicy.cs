using ComeYa.Domain.Entities;
using ComeYa.Domain.Enums;

namespace ComeYa.Domain.Services;

public static class OrderStatusPolicy
{
    public static bool IsValidBusinessTransition(OrderStatus current, OrderStatus next) =>
        (current, next) switch
        {
            (OrderStatus.Pending, OrderStatus.Confirmed) => true,
            (OrderStatus.Confirmed, OrderStatus.Preparing) => true,
            (OrderStatus.Preparing, OrderStatus.OnWay) => true,
            (OrderStatus.OnWay, OrderStatus.Delivered) => true,
            _ => false
        };

    public static DateTime? GetExpiresAt(Order order)
    {
        var itemExpirations = order.Items
            .Where(item => item.Product != null)
            .Select(item => (DateTime?)item.Product.ExpiresAt)
            .ToList();

        return itemExpirations.Count == 0 ? null : itemExpirations.Min();
    }

    public static bool IsExpired(Order order, DateTime nowUtc)
    {
        if (order.Status is OrderStatus.Delivered or OrderStatus.Cancelled)
            return false;

        var expiresAt = GetExpiresAt(order);
        return expiresAt.HasValue && expiresAt.Value <= nowUtc;
    }

    public static bool CanCustomerCancel(Order order, DateTime nowUtc) =>
        order.Status == OrderStatus.Pending && !IsExpired(order, nowUtc);

    public static bool CanBusinessChangeStatus(Order order, OrderStatus nextStatus, DateTime nowUtc) =>
        !IsExpired(order, nowUtc) && IsValidBusinessTransition(order.Status, nextStatus);

    public static string ToApiStatus(OrderStatus status) =>
        status == OrderStatus.OnWay
            ? "onway"
            : status.ToString().ToLowerInvariant();
}
