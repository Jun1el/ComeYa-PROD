using ComeYa.Domain.Common;

namespace ComeYa.Domain.Entities;

public class Notification : BaseEntity
{
    public Guid UserId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string Message { get; set; } = string.Empty;
    public string Type { get; set; } = string.Empty;
    public Guid? RelatedId { get; set; }
    public bool IsRead { get; set; } = false;

    public Profile User { get; set; } = null!;
}
