using ComeYa.Application.Common.Interfaces;
using ComeYa.Application.Products;
using ComeYa.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ComeYa.Infrastructure.Persistence;

public class ProductRepository : IProductRepository
{
    private readonly ComeYaDbContext _context;

    public ProductRepository(ComeYaDbContext context)
    {
        _context = context;
    }

    public async Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .AsNoTracking()
            .Include(p => p.Business)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .AsNoTracking()
            .Include(p => p.Business)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<IReadOnlyList<ProductSearchResult>> SearchActiveProductsAsync(
        ProductSearchCriteria criteria,
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Business)
            .ApplyFilters(criteria, DateTime.UtcNow)
            .ApplyOrdering(criteria.Sort);

        var originDistrict = criteria.OriginDistrict?.Trim();
        var projected = query.Select(p => new ProductSearchProjection
        {
            Product = p,
            DistanceKm = string.IsNullOrEmpty(originDistrict)
                ? null
                : p.Business.District == originDistrict
                    ? 0m
                    : _context.DistrictDistances
                        .Where(distance =>
                            (distance.DistrictA.Name == originDistrict
                                && distance.DistrictB.Name == p.Business.District)
                            || (distance.DistrictB.Name == originDistrict
                                && distance.DistrictA.Name == p.Business.District))
                        .Select(distance => (decimal?)distance.DistanceKm)
                        .FirstOrDefault()
        });

        if (criteria.MaxDistanceKm.HasValue && !string.IsNullOrEmpty(originDistrict))
        {
            projected = projected.Where(row =>
                row.DistanceKm.HasValue && row.DistanceKm.Value <= criteria.MaxDistanceKm.Value);
        }

        if (criteria.Sort == "distance" && !string.IsNullOrEmpty(originDistrict))
        {
            projected = projected
                .OrderBy(row => row.DistanceKm == null)
                .ThenBy(row => row.DistanceKm)
                .ThenBy(row => row.Product.Name);
        }

        var rows = await projected
            .Skip(criteria.Offset)
            .Take(criteria.Limit)
            .ToListAsync(cancellationToken);

        return rows
            .Select(row => new ProductSearchResult(row.Product, row.DistanceKm))
            .ToList();
    }

    public async Task<IReadOnlyList<Product>> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default)
    {
        return await _context.Products
            .AsNoTracking()
            .Where(p => p.BusinessId == businessId)
            .OrderByDescending(p => p.CreatedAt)
            .ToListAsync(cancellationToken);
    }

    public async Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default)
    {
        _context.Products.Add(product);
        await _context.SaveChangesAsync(cancellationToken);
        return product;
    }

    public async Task UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        product.UpdatedAt = DateTime.UtcNow;
        _context.Products.Update(product);
        await _context.SaveChangesAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var product = await _context.Products.FindAsync(new object[] { id }, cancellationToken);
        if (product != null)
        {
            product.IsActive = false;
            await _context.SaveChangesAsync(cancellationToken);
        }
    }

    private sealed class ProductSearchProjection
    {
        public Product Product { get; init; } = null!;
        public decimal? DistanceKm { get; init; }
    }
}
