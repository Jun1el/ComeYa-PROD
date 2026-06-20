using ComeYa.Domain.Common;
using ComeYa.Domain.Enums;

namespace ComeYa.Domain.Entities;

public class Coupon : BaseEntity
{
    public string Code { get; set; } = string.Empty;
    public int DiscountPercent { get; set; }
    public int MaxUses { get; set; }
    public int CurrentUses { get; set; }
    public decimal MinPurchase { get; set; }
    public Membership? MembershipRequired { get; set; }
    public DateTime ValidFrom { get; set; } = DateTime.UtcNow;
    public DateTime? ValidUntil { get; set; }
    public bool IsActive { get; set; } = true;

    public bool IsValid => IsActive
        && DateTime.UtcNow >= ValidFrom
        && (ValidUntil == null || DateTime.UtcNow < ValidUntil)
        && CurrentUses < MaxUses;

    public bool IsAvailableFor(Membership userMembership)
    {
        if (!IsValid) return false;
        if (MembershipRequired == null) return true;
        return userMembership >= MembershipRequired;
    }
}
