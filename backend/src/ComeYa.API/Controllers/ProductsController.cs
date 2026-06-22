using ComeYa.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComeYa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProductsController : ControllerBase
{
    private readonly IProductRepository _productRepository;
    private readonly IBusinessRepository _businessRepository;
    private readonly ICurrentUserService _currentUser;

    public ProductsController(
        IProductRepository productRepository,
        IBusinessRepository businessRepository,
        ICurrentUserService currentUser)
    {
        _productRepository = productRepository;
        _businessRepository = businessRepository;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetProducts(
        [FromQuery] string? category = null,
        [FromQuery] string? district = null,
        [FromQuery] Guid? businessId = null,
        [FromQuery] int limit = 50,
        [FromQuery] int offset = 0)
    {
        var products = await _productRepository.GetActiveProductsAsync(category, district, businessId, limit, offset);
        
        var result = products.Select(p => new
        {
            p.Id,
            p.Name,
            p.Description,
            Category = p.Category.ToString(),
            p.Price,
            p.OriginalPrice,
            p.ImageUrl,
            p.Stock,
            p.ExpiresAt,
            p.DiscountPercentage,
            p.HoursUntilExpiry,
            Business = new
            {
                p.Business.Id,
                p.Business.Name,
                p.Business.District,
                p.Business.Rating
            }
        });

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
            return NotFound();

        return Ok(new
        {
            product.Id,
            product.Name,
            product.Description,
            Category = product.Category.ToString(),
            product.Price,
            product.OriginalPrice,
            product.ImageUrl,
            product.Stock,
            product.ExpiresAt,
            product.DiscountPercentage,
            product.HoursUntilExpiry,
            Business = new
            {
                product.Business.Id,
                product.Business.Name,
                product.Business.District,
                product.Business.Rating
            }
        });
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateProduct([FromBody] CreateProductRequest request)
    {
        if (!_currentUser.IsAuthenticated)
            return Unauthorized();

        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var business = await _businessRepository.GetByOwnerIdAsync(userId.Value);
        if (business == null)
            return Forbid();

        if (string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { Message = "El nombre del producto es obligatorio." });

        if (!TryParseCategory(request.Category, out var category))
            return BadRequest(new { Message = "La categoría del producto no es válida." });

        if (request.Price <= 0 || request.OriginalPrice <= 0)
            return BadRequest(new { Message = "Los precios deben ser mayores que cero." });

        if (request.Stock < 0)
            return BadRequest(new { Message = "El stock no puede ser negativo." });

        if (request.ExpiresAt <= DateTime.UtcNow)
            return BadRequest(new { Message = "La fecha de vencimiento debe ser futura." });

        var product = new Domain.Entities.Product
        {
            BusinessId = business.Id,
            Name = request.Name.Trim(),
            Description = request.Description,
            Category = category,
            Price = request.Price,
            OriginalPrice = request.OriginalPrice,
            ImageUrl = request.ImageUrl,
            Stock = request.Stock,
            ExpiresAt = request.ExpiresAt
        };

        var created = await _productRepository.AddAsync(product);
        return CreatedAtAction(nameof(GetProduct), new { id = created.Id }, new
        {
            created.Id,
            created.BusinessId,
            created.Name,
            created.Description,
            Category = created.Category.ToString(),
            created.Price,
            created.OriginalPrice,
            created.ImageUrl,
            created.Stock,
            created.ExpiresAt,
            created.IsActive
        });
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateProduct(Guid id, [FromBody] UpdateProductRequest request)
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
            return NotFound();

        if (product.Business.OwnerId != userId.Value)
            return Forbid();

        if (request.Price.HasValue && request.Price.Value <= 0)
            return BadRequest(new { Message = "El precio debe ser mayor que cero." });
        if (request.OriginalPrice.HasValue && request.OriginalPrice.Value <= 0)
            return BadRequest(new { Message = "El precio original debe ser mayor que cero." });
        if (request.Stock.HasValue && request.Stock.Value < 0)
            return BadRequest(new { Message = "El stock no puede ser negativo." });
        if (request.ExpiresAt.HasValue && request.ExpiresAt.Value <= DateTime.UtcNow)
            return BadRequest(new { Message = "La fecha de vencimiento debe ser futura." });

        if (!string.IsNullOrEmpty(request.Name))
            product.Name = request.Name.Trim();
        if (request.Description != null)
            product.Description = request.Description;
        if (request.Price.HasValue)
            product.Price = request.Price.Value;
        if (request.OriginalPrice.HasValue)
            product.OriginalPrice = request.OriginalPrice.Value;
        if (request.Stock.HasValue)
            product.Stock = request.Stock.Value;
        if (request.ExpiresAt.HasValue)
            product.ExpiresAt = request.ExpiresAt.Value;

        await _productRepository.UpdateAsync(product);
        return NoContent();
    }

    [Authorize]
    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteProduct(Guid id)
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var product = await _productRepository.GetByIdAsync(id);
        if (product == null)
            return NotFound();

        if (product.Business.OwnerId != userId.Value)
            return Forbid();

        await _productRepository.DeleteAsync(id);
        return NoContent();
    }

    private static bool TryParseCategory(
        string category,
        out Domain.Enums.ProductCategory parsedCategory)
    {
        var normalizedCategory = category?.Trim() switch
        {
            "Panadería" => "Panaderia",
            var value => value
        };

        return Enum.TryParse(normalizedCategory, ignoreCase: true, out parsedCategory);
    }
}

public record CreateProductRequest(
    string Name,
    string? Description,
    string Category,
    decimal Price,
    decimal OriginalPrice,
    string? ImageUrl,
    int Stock,
    DateTime ExpiresAt
);

public record UpdateProductRequest(
    string? Name,
    string? Description,
    decimal? Price,
    decimal? OriginalPrice,
    int? Stock,
    DateTime? ExpiresAt
);
