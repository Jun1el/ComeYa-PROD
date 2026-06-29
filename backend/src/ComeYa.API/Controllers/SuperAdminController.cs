using ComeYa.Application.Common.Interfaces;
using ComeYa.Domain.Enums;
using ComeYa.Infrastructure.Persistence;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ComeYa.API.Controllers;

[ApiController]
[Route("api/superadmin")]
[Authorize]
public class SuperAdminController : ControllerBase
{
    private readonly ComeYaDbContext _context;
    private readonly ICurrentUserService _currentUser;

    public SuperAdminController(ComeYaDbContext context, ICurrentUserService currentUser)
    {
        _context = context;
        _currentUser = currentUser;
    }

    [HttpGet("metrics")]
    public async Task<IActionResult> GetMetrics()
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var profile = await _context.Profiles
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == userId.Value);

        if (profile?.Role != UserRole.SuperAdmin)
            return Forbid();

        var now = DateTime.UtcNow;
        var deliveredOrders = _context.Orders
            .AsNoTracking()
            .Where(o => o.Status == OrderStatus.Delivered);

        var totalSales = await deliveredOrders
            .Select(o => (decimal?)o.Total)
            .SumAsync() ?? 0;

        var deliveredOrdersList = await deliveredOrders
            .Select(o => new { o.CreatedAt, o.Total })
            .ToListAsync();

        var ordersByStatusData = await _context.Orders
            .AsNoTracking()
            .GroupBy(o => o.Status)
            .Select(g => new { Status = g.Key, Count = g.Count() })
            .ToListAsync();

        var productsByCategoryData = await _context.Products
            .AsNoTracking()
            .GroupBy(p => p.Category)
            .Select(g => new { Category = g.Key, Count = g.Count() })
            .ToListAsync();

        var monthlySales = deliveredOrdersList
            .GroupBy(o => new { o.CreatedAt.Year, o.CreatedAt.Month })
            .OrderBy(g => g.Key.Year)
            .ThenBy(g => g.Key.Month)
            .TakeLast(6)
            .Select(g => new
            {
                Period = $"{g.Key.Year}-{g.Key.Month:00}",
                Orders = g.Count(),
                Sales = g.Sum(o => o.Total)
            });

        var result = new
        {
            GeneratedAt = now,
            Summary = new
            {
                TotalCustomers = await _context.Profiles.CountAsync(p => p.Role == UserRole.Customer),
                TotalOwners = await _context.Profiles.CountAsync(p => p.Role == UserRole.Owner),
                TotalBusinesses = await _context.Businesses.CountAsync(),
                ActiveBusinesses = await _context.Businesses.CountAsync(b => b.IsActive),
                TotalProducts = await _context.Products.CountAsync(),
                ActiveProducts = await _context.Products.CountAsync(p => p.IsActive && p.ExpiresAt > now),
                ExpiredProducts = await _context.Products.CountAsync(p => p.ExpiresAt <= now),
                TotalOrders = await _context.Orders.CountAsync(),
                DeliveredOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Delivered),
                CancelledOrders = await _context.Orders.CountAsync(o => o.Status == OrderStatus.Cancelled),
                ActiveOrders = await _context.Orders.CountAsync(o =>
                    o.Status == OrderStatus.Pending
                    || o.Status == OrderStatus.Confirmed
                    || o.Status == OrderStatus.Preparing
                    || o.Status == OrderStatus.OnWay),
                TotalSales = totalSales,
                MealsRescued = await _context.UserStats.SumAsync(s => s.MealsRescued),
                MoneySaved = await _context.UserStats.Select(s => (decimal?)s.MoneySaved).SumAsync() ?? 0,
                Co2Avoided = await _context.UserStats.Select(s => (decimal?)s.Co2Avoided).SumAsync() ?? 0
            },
            OrdersByStatus = ordersByStatusData.Select(row => new
            {
                Status = row.Status == OrderStatus.OnWay ? "onway" : row.Status.ToString().ToLowerInvariant(),
                row.Count
            }),
            ProductsByCategory = productsByCategoryData.Select(row => new
            {
                Category = row.Category == ProductCategory.Panaderia ? "Panadería" : row.Category.ToString(),
                row.Count
            }),
            BusinessesByDistrict = await _context.Businesses
                .AsNoTracking()
                .GroupBy(b => b.District)
                .Select(g => new { District = g.Key, Count = g.Count() })
                .OrderByDescending(x => x.Count)
                .Take(8)
                .ToListAsync(),
            MonthlySales = monthlySales,
            HistoricalAnalysis = new
            {
                Status = "Pendiente de carga de dataset histórico",
                DataSource = "Base externa de panaderías, cafeterías, minimarkets o tiendas de alimentos con productos próximos a vencer.",
                PlannedModels = new[]
                {
                    "Predicción de demanda por categoría, distrito, horario, precio y descuento.",
                    "Sugerencia de descuentos dinámicos según cercanía a products.expires_at.",
                    "Comparación entre predicción histórica y ventas reales de ComeYa."
                },
                NextStep = "Cargar resultados del modelo ML para visualizarlos en esta vista."
            }
        };

        return Ok(result);
    }
}
