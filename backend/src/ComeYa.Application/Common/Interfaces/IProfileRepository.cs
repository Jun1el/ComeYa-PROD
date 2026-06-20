using ComeYa.Domain.Entities;

namespace ComeYa.Application.Common.Interfaces;

public interface IProfileRepository
{
    Task<Profile?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Profile?> GetByEmailAsync(string email, CancellationToken cancellationToken = default);
    Task UpdateAsync(Profile profile, CancellationToken cancellationToken = default);
}
