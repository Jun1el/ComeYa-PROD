using ComeYa.Application.Common.Interfaces;
using ComeYa.Application.Products;
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
        [FromQuery] string? q = null,
        [FromQuery] decimal? minPrice = null,
        [FromQuery] decimal? maxPrice = null,
        [FromQuery] string? originDistrict = null,
        [FromQuery] decimal? maxDistanceKm = null,
        [FromQuery] string sort = "expires-soon",
        [FromQuery] int limit = 50,
        [FromQuery] int offset = 0)
    {
        if (minPrice < 0 || maxPrice < 0 || (minPrice.HasValue && maxPrice.HasValue && minPrice > maxPrice))
            return BadRequest(new { Message = "El rango de precios no es válido." });

        if (maxDistanceKm < 0)
            return BadRequest(new { Message = "La distancia máxima no puede ser negativa." });

        if (limit is < 1 or > 100 || offset < 0)
            return BadRequest(new { Message = "La paginación no es válida." });

        Domain.Enums.ProductCategory? parsedCategory = null;
        if (!string.IsNullOrWhiteSpace(category))
        {
            if (!TryParseCategory(category, out var categoryValue))
                return BadRequest(new { Message = "La categoría del producto no es válida." });
            parsedCategory = categoryValue;
        }

        var allowedSorts = new[] { "expires-soon", "name-asc", "name-desc", "price-asc", "price-desc", "distance" };
        if (!allowedSorts.Contains(sort))
            return BadRequest(new { Message = "El criterio de ordenamiento no es válido." });

        var criteria = new ProductSearchCriteria(
            Query: q,
            Category: parsedCategory,
            District: district,
            BusinessId: businessId,
            MinPrice: minPrice,
            MaxPrice: maxPrice,
            OriginDistrict: originDistrict,
            MaxDistanceKm: maxDistanceKm,
            Sort: sort,
            Limit: limit,
            Offset: offset);

        var products = await _productRepository.SearchActiveProductsAsync(criteria);
        
        var result = products.Select(row => new
        {
            row.DistanceKm,
            row.Product.Id,
            row.Product.Name,
            row.Product.Description,
            Category = row.Product.Category == Domain.Enums.ProductCategory.Panaderia
                ? "Panadería"
                : row.Product.Category.ToString(),
            row.Product.Price,
            row.Product.OriginalPrice,
            row.Product.ImageUrl,
            row.Product.Stock,
            row.Product.ExpiresAt,
            row.Product.DiscountPercentage,
            row.Product.HoursUntilExpiry,
            Business = new
            {
                row.Product.Business.Id,
                row.Product.Business.Name,
                row.Product.Business.District,
                row.Product.Business.Rating
            }
        });

        return Ok(result);
    }

    /*
        El detalle conserva el contrato existente; la distancia solo aplica al listado,
        donde se conoce el distrito de origen de la búsqueda.
    */
    [HttpGet("{id}")]
    public async Task<IActionResult> GetProduct(Guid id)
    {
        var p = await _productRepository.GetByIdAsync(id);
        if (p == null)
            return NotFound();

        return Ok(new
        {
            p.Id,
            p.Name,
            p.Description,
            Category = p.Category == Domain.Enums.ProductCategory.Panaderia
                ? "Panadería"
                : p.Category.ToString(),
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
    }

    [Authorize]
    [HttpGet("mine")]
    public async Task<IActionResult> GetMyProducts()
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var business = await _businessRepository.GetByOwnerIdAsync(userId.Value);
        if (business == null)
            return Forbid();

        var products = await _productRepository.GetByBusinessIdAsync(business.Id);
        var now = DateTime.UtcNow;

        return Ok(products.Select(p => new
        {
            p.Id,
            p.BusinessId,
            p.Name,
            p.Description,
            Category = p.Category == Domain.Enums.ProductCategory.Panaderia
                ? "Panadería"
                : p.Category.ToString(),
            p.Price,
            p.OriginalPrice,
            p.ImageUrl,
            p.Stock,
            p.ExpiresAt,
            p.IsActive,
            p.CreatedAt,
            p.UpdatedAt,
            Status = !p.IsActive
                ? "inactive"
                : p.Stock <= 0 || p.ExpiresAt <= now
                    ? "attention"
                    : "published"
        }));
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

        if (request.OriginalPrice < request.Price)
            return BadRequest(new { Message = "El precio original debe ser mayor o igual al precio de venta." });

        if (request.Stock < 0)
            return BadRequest(new { Message = "El stock no puede ser negativo." });

        if (request.ExpiresAt <= DateTime.UtcNow)
            return BadRequest(new { Message = "La fecha de vencimiento debe ser futura." });

        if (!IsValidImageUrl(request.ImageUrl))
            return BadRequest(new { Message = "La URL de imagen debe usar http o https." });

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

        var currentStock = product.Stock;

        if (request.Name != null && string.IsNullOrWhiteSpace(request.Name))
            return BadRequest(new { Message = "El nombre del producto es obligatorio." });
        if (request.Price.HasValue && request.Price.Value <= 0)
            return BadRequest(new { Message = "El precio debe ser mayor que cero." });
        if (request.OriginalPrice.HasValue && request.OriginalPrice.Value <= 0)
            return BadRequest(new { Message = "El precio original debe ser mayor que cero." });
        if (request.Stock.HasValue && request.Stock.Value < 0)
            return BadRequest(new { Message = "El stock no puede ser negativo." });
        if (request.ExpiresAt.HasValue && request.ExpiresAt.Value <= DateTime.UtcNow)
            return BadRequest(new { Message = "La fecha de vencimiento debe ser futura." });

        Domain.Enums.ProductCategory? category = null;
        if (request.Category != null)
        {
            if (!TryParseCategory(request.Category, out var parsedCategory))
                return BadRequest(new { Message = "La categoría del producto no es válida." });
            category = parsedCategory;
        }

        if (!IsValidImageUrl(request.ImageUrl))
            return BadRequest(new { Message = "La URL de imagen debe usar http o https." });

        if (!string.IsNullOrEmpty(request.Name))
            product.Name = request.Name.Trim();
        if (request.Description != null)
            product.Description = string.IsNullOrWhiteSpace(request.Description) ? null : request.Description.Trim();
        if (category.HasValue)
            product.Category = category.Value;
        if (request.Price.HasValue)
            product.Price = request.Price.Value;
        if (request.OriginalPrice.HasValue)
            product.OriginalPrice = request.OriginalPrice.Value;
        if (request.Stock.HasValue)
            product.Stock = request.Stock.Value;
        if (request.ExpiresAt.HasValue)
            product.ExpiresAt = request.ExpiresAt.Value;
        if (request.ImageUrl != null)
            product.ImageUrl = string.IsNullOrWhiteSpace(request.ImageUrl) ? null : request.ImageUrl.Trim();
        if (request.IsActive.HasValue)
            product.IsActive = request.IsActive.Value;

        if (product.OriginalPrice < product.Price)
            return BadRequest(new { Message = "El precio original debe ser mayor o igual al precio de venta." });

        if (request.IsActive == true && (product.Stock <= 0 || product.ExpiresAt <= DateTime.UtcNow))
            return BadRequest(new { Message = "Para republicar, el producto debe tener stock y vencimiento futuro." });

        var expectedStock = request.ExpectedStock ?? currentStock;
        var updated = await _productRepository.TryUpdateAsync(product, expectedStock);
        if (!updated)
            return Conflict(new { Message = "El stock cambió mientras editabas. Recarga el producto antes de guardar." });

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

    private static bool IsValidImageUrl(string? imageUrl)
    {
        if (string.IsNullOrWhiteSpace(imageUrl))
            return true;

        return Uri.TryCreate(imageUrl.Trim(), UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
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
    string? Category,
    decimal? Price,
    decimal? OriginalPrice,
    string? ImageUrl,
    int? Stock,
    DateTime? ExpiresAt,
    bool? IsActive,
    int? ExpectedStock
);
