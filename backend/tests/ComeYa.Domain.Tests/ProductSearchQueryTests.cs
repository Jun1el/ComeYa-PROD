using ComeYa.Application.Products;
using ComeYa.Domain.Entities;
using ComeYa.Domain.Enums;
using Xunit;

namespace ComeYa.Domain.Tests;

public class ProductSearchQueryTests
{
    private static readonly DateTime Now = new(2026, 7, 1, 12, 0, 0, DateTimeKind.Utc);

    [Fact]
    public void ApplyFilters_CombinaTextoCategoriaPrecioYDistrito()
    {
        var products = CreateProducts().AsQueryable();
        var criteria = new ProductSearchCriteria(
            Query: "pan",
            Category: ProductCategory.Panaderia,
            District: "Los Olivos",
            MinPrice: 5,
            MaxPrice: 10);

        var result = products.ApplyFilters(criteria, Now).ToList();

        var product = Assert.Single(result);
        Assert.Equal("Pack de pan", product.Name);
    }

    [Fact]
    public void ApplyFilters_UsaCategoriaExacta()
    {
        var result = CreateProducts().AsQueryable()
            .ApplyFilters(new ProductSearchCriteria(Category: ProductCategory.Bebidas), Now)
            .ToList();

        var product = Assert.Single(result);
        Assert.Equal(ProductCategory.Bebidas, product.Category);
    }

    [Fact]
    public void ApplyOrdering_OrdenaAlfabeticamenteYPorPrecio()
    {
        var products = CreateProducts().AsQueryable();

        var byName = products.ApplyOrdering("name-asc").Select(p => p.Name).ToList();
        var byPrice = products.ApplyOrdering("price-desc").Select(p => p.Price).ToList();

        Assert.Equal(new[] { "Jugo", "Pack de pan", "Postre" }, byName);
        Assert.Equal(new[] { 12m, 8m, 6m }, byPrice);
    }

    private static List<Product> CreateProducts()
    {
        var losOlivos = new Business { Id = Guid.NewGuid(), Name = "Panadería Norte", District = "Los Olivos", IsActive = true };
        var comas = new Business { Id = Guid.NewGuid(), Name = "Tienda Sur", District = "Comas", IsActive = true };

        return new List<Product>
        {
            new() { Name = "Pack de pan", Description = "Pan del día", Category = ProductCategory.Panaderia, Price = 8, OriginalPrice = 15, ExpiresAt = Now.AddHours(2), IsActive = true, Business = losOlivos, BusinessId = losOlivos.Id },
            new() { Name = "Jugo", Category = ProductCategory.Bebidas, Price = 6, OriginalPrice = 10, ExpiresAt = Now.AddHours(4), IsActive = true, Business = comas, BusinessId = comas.Id },
            new() { Name = "Postre", Category = ProductCategory.Postres, Price = 12, OriginalPrice = 20, ExpiresAt = Now.AddHours(3), IsActive = true, Business = losOlivos, BusinessId = losOlivos.Id }
        };
    }
}
