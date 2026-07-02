using ComeYa.Domain.Entities;
using ComeYa.Application.Products;

namespace ComeYa.Application.Common.Interfaces;

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductSearchResult>> SearchActiveProductsAsync(ProductSearchCriteria criteria, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Product>> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default);
    Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default);
    Task UpdateAsync(Product product, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}
