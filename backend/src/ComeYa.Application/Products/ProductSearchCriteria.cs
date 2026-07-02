using ComeYa.Domain.Enums;

namespace ComeYa.Application.Products;

public sealed record ProductSearchCriteria(
    string? Query = null,
    ProductCategory? Category = null,
    string? District = null,
    Guid? BusinessId = null,
    decimal? MinPrice = null,
    decimal? MaxPrice = null,
    string? OriginDistrict = null,
    decimal? MaxDistanceKm = null,
    string Sort = "expires-soon",
    int Limit = 50,
    int Offset = 0);
