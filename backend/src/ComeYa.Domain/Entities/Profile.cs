using ComeYa.Domain.Common;
using ComeYa.Domain.Enums;

namespace ComeYa.Domain.Entities;

public class Profile : BaseEntity
{
    public string Email { get; set; } = string.Empty;
    public string FullName { get; set; } = string.Empty;
    public UserRole Role { get; set; } = UserRole.Customer;
    public string? District { get; set; }
    public Membership Membership { get; set; } = Membership.Free;
    public DateTime? MembershipDate { get; set; }
    public string? BusinessName { get; set; }
    public string? BusinessPhone { get; set; }
    public string? AvatarUrl { get; set; }

    public Business? Business { get; set; }
    public UserStats? Stats { get; set; }
    public ICollection<Order> Orders { get; set; } = new List<Order>();
    public ICollection<PaymentCard> PaymentCards { get; set; } = new List<PaymentCard>();
    public ICollection<Notification> Notifications { get; set; } = new List<Notification>();
}
