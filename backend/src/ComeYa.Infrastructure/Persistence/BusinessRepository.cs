using ComeYa.Application.Common.Interfaces;
using ComeYa.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ComeYa.Infrastructure.Persistence;

public class BusinessRepository : IBusinessRepository
{
    private readonly ComeYaDbContext _context;

    public BusinessRepository(ComeYaDbContext context)
    {
        _context = context;
    }

    public async Task<Business?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Businesses
            .Include(b => b.Owner)
            .Include(b => b.Products)
            .FirstOrDefaultAsync(b => b.Id == id, cancellationToken);
    }

    public async Task<Business?> GetByOwnerIdAsync(Guid ownerId, CancellationToken cancellationToken = default)
    {
        return await _context.Businesses
            .Include(b => b.Products)
            .FirstOrDefaultAsync(b => b.OwnerId == ownerId, cancellationToken);
    }

    public async Task<IReadOnlyList<Business>> GetAllActiveAsync(CancellationToken cancellationToken = default)
    {
        return await _context.Businesses
            .Include(b => b.Owner)
            .Where(b => b.IsActive)
            .ToListAsync(cancellationToken);
    }

    public async Task<Business> AddAsync(Business business, CancellationToken cancellationToken = default)
    {
        _context.Businesses.Add(business);
        await _context.SaveChangesAsync(cancellationToken);
        return business;
    }

    public async Task UpdateAsync(Business business, CancellationToken cancellationToken = default)
    {
        business.UpdatedAt = DateTime.UtcNow;
        _context.Businesses.Update(business);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
