using ComeYa.Application.Common.Interfaces;
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

    public async Task<IReadOnlyList<Product>> GetActiveProductsAsync(
        string? category = null, 
        string? district = null, 
        Guid? businessId = null, 
        int limit = 50, 
        int offset = 0, 
        CancellationToken cancellationToken = default)
    {
        var query = _context.Products
            .AsNoTracking()
            .Include(p => p.Business)
            .Where(p => p.IsActive && p.ExpiresAt > DateTime.UtcNow && p.Business.IsActive);

        if (!string.IsNullOrEmpty(category))
            query = query.Where(p => p.Category.ToString() == category);

        if (!string.IsNullOrEmpty(district))
            query = query.Where(p => p.Business.District == district);

        if (businessId.HasValue)
            query = query.Where(p => p.BusinessId == businessId.Value);

        return await query
            .OrderBy(p => p.ExpiresAt)
            .Skip(offset)
            .Take(limit)
            .ToListAsync(cancellationToken);
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
}
