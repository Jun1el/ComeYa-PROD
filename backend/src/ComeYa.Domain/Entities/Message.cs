using ComeYa.Domain.Common;
using ComeYa.Domain.Enums;

namespace ComeYa.Domain.Entities;

public class Message : BaseEntity
{
    public Guid OrderId { get; set; }
    public Guid SenderId { get; set; }
    public UserRole SenderRole { get; set; }
    public string Content { get; set; } = string.Empty;
    public bool IsRead { get; set; } = false;

    public Order Order { get; set; } = null!;
    public Profile Sender { get; set; } = null!;
}
