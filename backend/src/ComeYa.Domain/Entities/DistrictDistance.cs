namespace ComeYa.Domain.Entities;

public class DistrictDistance
{
    public int DistrictAId { get; set; }
    public int DistrictBId { get; set; }
    public decimal DistanceKm { get; set; }

    public District DistrictA { get; set; } = null!;
    public District DistrictB { get; set; } = null!;
}
