using ComeYa.Application.Common.Interfaces;
using ComeYa.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ComeYa.Infrastructure.Persistence;

public class ProfileRepository : IProfileRepository
{
    private readonly ComeYaDbContext _context;

    public ProfileRepository(ComeYaDbContext context)
    {
        _context = context;
    }

    public async Task<Profile?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        return await _context.Profiles
            .Include(p => p.Stats)
            .FirstOrDefaultAsync(p => p.Id == id, cancellationToken);
    }

    public async Task<Profile?> GetByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        return await _context.Profiles
            .Include(p => p.Stats)
            .FirstOrDefaultAsync(p => p.Email == email, cancellationToken);
    }

    public async Task UpdateAsync(Profile profile, CancellationToken cancellationToken = default)
    {
        profile.UpdatedAt = DateTime.UtcNow;
        _context.Profiles.Update(profile);
        await _context.SaveChangesAsync(cancellationToken);
    }
}
