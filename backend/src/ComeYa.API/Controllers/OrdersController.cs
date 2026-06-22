using ComeYa.Application.Common.Interfaces;
using ComeYa.Domain.Entities;
using ComeYa.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComeYa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class OrdersController : ControllerBase
{
    private readonly IOrderRepository _orderRepository;
    private readonly IProductRepository _productRepository;
    private readonly IBusinessRepository _businessRepository;
    private readonly ICurrentUserService _currentUser;

    public OrdersController(
        IOrderRepository orderRepository,
        IProductRepository productRepository,
        IBusinessRepository businessRepository,
        ICurrentUserService currentUser)
    {
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _businessRepository = businessRepository;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetMyOrders()
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        IReadOnlyList<Order> orders;

        var business = await _businessRepository.GetByOwnerIdAsync(userId.Value);
        if (business != null)
        {
            orders = await _orderRepository.GetByBusinessIdAsync(business.Id);
        }
        else
        {
            orders = await _orderRepository.GetByCustomerIdAsync(userId.Value);
        }

        var result = orders.Select(o => new
        {
            o.Id,
            o.BusinessId,
            BusinessName = o.Business?.Name,
            o.Status,
            o.Subtotal,
            o.ShippingCost,
            o.Discount,
            o.CouponCode,
            o.Total,
            o.PaymentMethod,
            o.DeliveryAddress,
            o.DeliveryDistrict,
            o.EstimatedDelivery,
            o.DeliveredAt,
            o.CreatedAt,
            Items = o.Items.Select(i => new
            {
                i.Id,
                i.ProductId,
                i.Name,
                i.Price,
                i.Quantity,
                i.Subtotal
            }),
            MessagesCount = o.Messages?.Count ?? 0,
            UnreadMessages = o.Messages?.Count(m => !m.IsRead) ?? 0
        });

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetOrder(Guid id)
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var order = await _orderRepository.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        if (order.CustomerId != userId && order.Business?.OwnerId != userId)
            return Forbid();

        return Ok(new
        {
            order.Id,
            order.CustomerId,
            order.BusinessId,
            BusinessName = order.Business?.Name,
            BusinessPhone = order.Business?.Phone,
            order.Status,
            order.Subtotal,
            order.ShippingCost,
            order.Discount,
            order.CouponCode,
            order.Total,
            order.PaymentMethod,
            order.DeliveryAddress,
            order.DeliveryDistrict,
            order.EstimatedDelivery,
            order.DeliveredAt,
            order.Notes,
            order.CreatedAt,
            Items = order.Items.Select(i => new
            {
                i.Id,
                i.ProductId,
                i.Name,
                i.Price,
                i.Quantity,
                i.Subtotal
            }),
            Messages = order.Messages?.Select(m => new
            {
                m.Id,
                m.SenderId,
                m.SenderRole,
                m.Content,
                m.IsRead,
                m.CreatedAt
            })
        });
    }

    [HttpPost]
    public async Task<IActionResult> CreateOrder([FromBody] CreateOrderRequest request)
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var orders = new List<object>();

        foreach (var businessGroup in request.Items.GroupBy(i => i.BusinessId))
        {
            var business = await _businessRepository.GetByIdAsync(businessGroup.Key);
            if (business == null)
                continue;

            var orderItems = new List<OrderItem>();
            decimal subtotal = 0;

            foreach (var item in businessGroup)
            {
                var product = await _productRepository.GetByIdAsync(item.ProductId);
                if (product == null || product.Stock < item.Quantity)
                    continue;

                var orderItem = new OrderItem
                {
                    ProductId = product.Id,
                    Name = product.Name,
                    Price = product.Price,
                    Quantity = item.Quantity
                };
                orderItems.Add(orderItem);
                subtotal += orderItem.Price * orderItem.Quantity;
            }

            if (!orderItems.Any())
                continue;

            var shippingCost = CalculateShippingCost(request.DeliveryDistrict, business.District);
            var discount = request.Discount ?? 0;
            var total = subtotal + shippingCost - discount;

            var estimatedDelivery = DateTime.UtcNow.AddMinutes(CalculateDeliveryMinutes(request.DeliveryDistrict, business.District));

            var order = new Order
            {
                CustomerId = userId.Value,
                BusinessId = business.Id,
                Subtotal = subtotal,
                ShippingCost = shippingCost,
                Discount = discount,
                CouponCode = request.CouponCode,
                Total = total,
                PaymentMethod = Enum.Parse<PaymentMethod>(request.PaymentMethod, true),
                DeliveryAddress = request.DeliveryAddress,
                DeliveryDistrict = request.DeliveryDistrict,
                EstimatedDelivery = estimatedDelivery,
                Notes = request.Notes,
                Items = orderItems
            };

            var created = await _orderRepository.AddAsync(order);
            orders.Add(new { OrderId = created.Id, BusinessName = business.Name, Total = created.Total });
        }

        return CreatedAtAction(nameof(GetMyOrders), new { }, orders);
    }

    [HttpPut("{id}/status")]
    public async Task<IActionResult> UpdateOrderStatus(Guid id, [FromBody] UpdateStatusRequest request)
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var order = await _orderRepository.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        if (order.Business?.OwnerId != userId)
            return Forbid();

        var status = Enum.Parse<OrderStatus>(request.Status, true);
        await _orderRepository.UpdateStatusAsync(id, status);

        return NoContent();
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> CancelOrder(Guid id)
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var order = await _orderRepository.GetByIdAsync(id);
        if (order == null)
            return NotFound();

        if (order.CustomerId != userId)
            return Forbid();

        if (!order.CanBeCancelled)
            return BadRequest(new { Message = "La orden no puede ser cancelada" });

        await _orderRepository.UpdateStatusAsync(id, OrderStatus.Cancelled);
        return NoContent();
    }

    private decimal CalculateShippingCost(string? userDistrict, string businessDistrict)
    {
        if (string.IsNullOrEmpty(userDistrict))
            return 4.00m;

        var distances = new Dictionary<(string, string), decimal>
        {
            { ("San Martin de Porres", "Comas"), 6.0m },
            { ("San Martin de Porres", "Los Olivos"), 4.0m },
            { ("San Martin de Porres", "Independencia"), 3.0m },
            { ("Comas", "Los Olivos"), 5.0m },
            { ("Los Olivos", "Independencia"), 6.0m }
        };

        var key = string.Compare(userDistrict, businessDistrict, StringComparison.Ordinal) < 0
            ? (userDistrict, businessDistrict)
            : (businessDistrict, userDistrict);

        var distance = distances.GetValueOrDefault(key, 10.0m);

        if (distance <= 10) return 4.00m;
        if (distance <= 25) return 6.00m;
        return 8.00m;
    }

    private int CalculateDeliveryMinutes(string? userDistrict, string businessDistrict)
    {
        var shippingCost = CalculateShippingCost(userDistrict, businessDistrict);
        var distance = shippingCost == 4.00m ? 5.0 : shippingCost == 6.00m ? 15.0 : 30.0;
        return Math.Min(60, Math.Max(15, 15 + (int)(distance * 2)));
    }
}

public record CreateOrderRequest(
    List<OrderItemRequest> Items,
    string? DeliveryAddress,
    string? DeliveryDistrict,
    string PaymentMethod,
    string? CouponCode,
    decimal? Discount,
    string? Notes
);

public record OrderItemRequest(
    Guid ProductId,
    Guid BusinessId,
    int Quantity
);

public record UpdateStatusRequest(string Status);
