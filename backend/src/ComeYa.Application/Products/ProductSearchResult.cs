using ComeYa.Domain.Entities;

namespace ComeYa.Application.Products;

public sealed record ProductSearchResult(Product Product, decimal? DistanceKm);
