using ComeYa.Domain.Entities;

namespace ComeYa.Application.Common.Interfaces;

public interface IBusinessRepository
{
    Task<Business?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<Business?> GetByOwnerIdAsync(Guid ownerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Business>> GetAllActiveAsync(CancellationToken cancellationToken = default);
    Task<Business> AddAsync(Business business, CancellationToken cancellationToken = default);
    Task UpdateAsync(Business business, CancellationToken cancellationToken = default);
}
