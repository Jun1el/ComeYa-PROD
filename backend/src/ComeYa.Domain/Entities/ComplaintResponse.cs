using ComeYa.Domain.Common;

namespace ComeYa.Domain.Entities;

public class ComplaintResponse : BaseEntity
{
    public Guid ComplaintId { get; set; }
    public Guid ResponderId { get; set; }
    public string Content { get; set; } = string.Empty;

    public Complaint Complaint { get; set; } = null!;
    public Profile Responder { get; set; } = null!;
}
