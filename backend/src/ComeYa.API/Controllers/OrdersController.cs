using ComeYa.Application.Common.Interfaces;
using ComeYa.Domain.Entities;
using ComeYa.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;

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
    private readonly ILogger<OrdersController> _logger;

    public OrdersController(
        IOrderRepository orderRepository,
        IProductRepository productRepository,
        IBusinessRepository businessRepository,
        ICurrentUserService currentUser,
        ILogger<OrdersController> logger)
    {
        _orderRepository = orderRepository;
        _productRepository = productRepository;
        _businessRepository = businessRepository;
        _currentUser = currentUser;
        _logger = logger;
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

        if (request.Items == null || request.Items.Count == 0)
            return BadRequest(new { Message = "El pedido debe contener al menos un producto." });

        if (!Enum.TryParse<PaymentMethod>(request.PaymentMethod, true, out var paymentMethod))
            return BadRequest(new { Message = "El método de pago no es válido." });

        if (request.Discount is < 0)
            return BadRequest(new { Message = "El descuento no puede ser negativo." });

        var normalizedItems = request.Items
            .GroupBy(item => item.ProductId)
            .Select(group => new OrderItemRequest(
                group.Key,
                group.Sum(item => item.Quantity)))
            .ToList();

        var validatedItems = new List<(OrderItemRequest Request, Product Product)>();

        foreach (var item in normalizedItems)
        {
            if (item.Quantity <= 0)
                return BadRequest(new { Message = "La cantidad de cada producto debe ser mayor que cero." });

            var product = await _productRepository.GetByIdAsync(item.ProductId);
            if (product == null || !product.IsActive || product.IsExpired)
                return BadRequest(new { Message = "Uno de los productos ya no está disponible." });

            if (product.Stock < item.Quantity)
            {
                return BadRequest(new
                {
                    Message = $"Stock insuficiente para {product.Name}. Disponible: {product.Stock}."
                });
            }

            validatedItems.Add((item, product));
        }

        var orders = new List<object>();

        foreach (var businessGroup in validatedItems.GroupBy(item => item.Product.BusinessId))
        {
            var business = await _businessRepository.GetByIdAsync(businessGroup.Key);
            if (business == null)
                return BadRequest(new { Message = "Uno de los restaurantes ya no está disponible." });

            var orderItems = new List<OrderItem>();
            decimal subtotal = 0;

            foreach (var item in businessGroup)
            {
                var orderItem = new OrderItem
                {
                    ProductId = item.Product.Id,
                    Name = item.Product.Name,
                    Price = item.Product.Price,
                    Quantity = item.Request.Quantity
                };
                orderItems.Add(orderItem);
                subtotal += orderItem.Price * orderItem.Quantity;
            }

            var shippingCost = CalculateShippingCost(request.DeliveryDistrict, business.District);
            var discount = request.Discount ?? 0;
            if (discount > subtotal)
                return BadRequest(new { Message = "El descuento no puede superar el subtotal." });

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
                PaymentMethod = paymentMethod,
                DeliveryAddress = request.DeliveryAddress,
                DeliveryDistrict = request.DeliveryDistrict,
                EstimatedDelivery = estimatedDelivery,
                Notes = request.Notes,
                Items = orderItems
            };

            Order created;
            try
            {
                created = await _orderRepository.AddAsync(order);
            }
            catch (DbUpdateException exception)
            {
                var postgresException = exception.InnerException as PostgresException;

                _logger.LogError(
                    exception,
                    "Error al crear pedido para el usuario {UserId}. PostgreSQL {SqlState}: {DatabaseMessage}",
                    userId.Value,
                    postgresException?.SqlState,
                    postgresException?.MessageText);

                if (postgresException?.SqlState == "P0001")
                {
                    return BadRequest(new
                    {
                        Message = "El stock cambió mientras confirmabas el pedido. Actualiza el carrito e intenta nuevamente."
                    });
                }

                if (postgresException?.SqlState is "23503" or "23514")
                {
                    return BadRequest(new
                    {
                        Message = "Los datos del pedido ya no son válidos. Actualiza la página e intenta nuevamente."
                    });
                }

                return StatusCode(StatusCodes.Status500InternalServerError, new
                {
                    Message = "No se pudo guardar el pedido. Revisa el log del backend para ver el error de base de datos."
                });
            }

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
    int Quantity
);

public record UpdateStatusRequest(string Status);
