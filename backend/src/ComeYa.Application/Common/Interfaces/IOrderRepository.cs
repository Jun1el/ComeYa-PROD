using ComeYa.Domain.Entities;
using ComeYa.Domain.Enums;

namespace ComeYa.Application.Common.Interfaces;

public interface IOrderRepository
{
    Task<Order?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Order>> GetByCustomerIdAsync(Guid customerId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Order>> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default);
    Task<Order> AddAsync(Order order, CancellationToken cancellationToken = default);
    Task UpdateAsync(Order order, CancellationToken cancellationToken = default);
    Task UpdateStatusAsync(Guid orderId, OrderStatus status, CancellationToken cancellationToken = default);
}
