using ComeYa.Domain.Entities;
using ComeYa.Domain.Enums;
using ComeYa.Domain.Services;
using Xunit;

namespace ComeYa.Domain.Tests;

public class OrderStatusPolicyTests
{
    private static readonly DateTime Now = new(2026, 6, 25, 12, 0, 0, DateTimeKind.Utc);

    [Theory]
    [InlineData(OrderStatus.Pending, OrderStatus.Confirmed)]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Preparing)]
    [InlineData(OrderStatus.Preparing, OrderStatus.OnWay)]
    [InlineData(OrderStatus.OnWay, OrderStatus.Delivered)]
    public void IsValidBusinessTransition_AllowsExpectedFlow(OrderStatus current, OrderStatus next)
    {
        var isValid = OrderStatusPolicy.IsValidBusinessTransition(current, next);

        Assert.True(isValid);
    }

    [Theory]
    [InlineData(OrderStatus.Pending, OrderStatus.Delivered)]
    [InlineData(OrderStatus.Pending, OrderStatus.Preparing)]
    [InlineData(OrderStatus.Confirmed, OrderStatus.Delivered)]
    [InlineData(OrderStatus.Delivered, OrderStatus.OnWay)]
    [InlineData(OrderStatus.Cancelled, OrderStatus.Confirmed)]
    public void IsValidBusinessTransition_RejectsSkippedOrClosedStates(OrderStatus current, OrderStatus next)
    {
        var isValid = OrderStatusPolicy.IsValidBusinessTransition(current, next);

        Assert.False(isValid);
    }

    [Fact]
    public void CanCustomerCancel_AllowsPendingOrderBeforeProductExpires()
    {
        var order = new Order
        {
            Status = OrderStatus.Pending,
            Items =
            {
                new OrderItem
                {
                    Product = new Product { ExpiresAt = Now.AddHours(2) }
                }
            }
        };

        var canCancel = OrderStatusPolicy.CanCustomerCancel(order, Now);

        Assert.True(canCancel);
    }

    [Fact]
    public void CanCustomerCancel_RejectsPendingOrderWithExpiredProduct()
    {
        var order = new Order
        {
            Status = OrderStatus.Pending,
            Items =
            {
                new OrderItem
                {
                    Product = new Product { ExpiresAt = Now.AddMinutes(-1) }
                }
            }
        };

        var canCancel = OrderStatusPolicy.CanCustomerCancel(order, Now);

        Assert.False(canCancel);
    }

    [Fact]
    public void CanBusinessChangeStatus_RejectsExpiredOrder()
    {
        var order = new Order
        {
            Status = OrderStatus.Pending,
            Items =
            {
                new OrderItem
                {
                    Product = new Product { ExpiresAt = Now }
                }
            }
        };

        var canChange = OrderStatusPolicy.CanBusinessChangeStatus(order, OrderStatus.Confirmed, Now);

        Assert.False(canChange);
    }

    [Fact]
    public void GetExpiresAt_UsesEarliestProductExpiration()
    {
        var earliest = Now.AddHours(1);
        var order = new Order
        {
            Items =
            {
                new OrderItem
                {
                    Product = new Product { ExpiresAt = Now.AddHours(3) }
                },
                new OrderItem
                {
                    Product = new Product { ExpiresAt = earliest }
                }
            }
        };

        var expiresAt = OrderStatusPolicy.GetExpiresAt(order);

        Assert.Equal(earliest, expiresAt);
    }

    [Fact]
    public void ToApiStatus_UsesDatabaseValueForOnWay()
    {
        var status = OrderStatusPolicy.ToApiStatus(OrderStatus.OnWay);

        Assert.Equal("onway", status);
    }
}
