using ComeYa.Domain.Common;

namespace ComeYa.Domain.Entities;

public class Complaint : BaseEntity
{
    public Guid OrderId { get; set; }
    public Guid CustomerId { get; set; }
    public string Category { get; set; } = string.Empty;
    public string Subject { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public string Status { get; set; } = "pending";
    public string? ResolutionNotes { get; set; }
    public DateTime? ResolvedAt { get; set; }

    public Order Order { get; set; } = null!;
    public Profile Customer { get; set; } = null!;
    public ICollection<ComplaintResponse> Responses { get; set; } = new List<ComplaintResponse>();
}
