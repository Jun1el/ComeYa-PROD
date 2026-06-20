using ComeYa.Domain.Common;

namespace ComeYa.Domain.Entities;

public class PaymentCard : BaseEntity
{
    public Guid UserId { get; set; }
    public string CardBrand { get; set; } = string.Empty;
    public string LastFour { get; set; } = string.Empty;
    public string CardholderName { get; set; } = string.Empty;
    public int ExpiryMonth { get; set; }
    public int ExpiryYear { get; set; }
    public bool IsDefault { get; set; }

    public Profile User { get; set; } = null!;

    public bool IsExpired => DateTime.UtcNow.Year > ExpiryYear
        || (DateTime.UtcNow.Year == ExpiryYear && DateTime.UtcNow.Month > ExpiryMonth);
}
