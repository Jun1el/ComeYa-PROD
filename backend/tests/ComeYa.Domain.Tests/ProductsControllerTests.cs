using ComeYa.API.Controllers;
using ComeYa.Application.Common.Interfaces;
using ComeYa.Application.Products;
using ComeYa.Domain.Entities;
using ComeYa.Domain.Enums;
using Microsoft.AspNetCore.Mvc;
using Xunit;

namespace ComeYa.Domain.Tests;

public class ProductsControllerTests
{
    [Fact]
    public async Task GetMyProducts_ReturnsOnlyAuthenticatedOwnersBusiness()
    {
        var ownerId = Guid.NewGuid();
        var business = CreateBusiness(ownerId);
        var products = new[] { CreateProduct(business) };
        var productRepository = new FakeProductRepository { BusinessProducts = products };
        var controller = CreateController(ownerId, business, productRepository);

        var result = await controller.GetMyProducts();

        var ok = Assert.IsType<OkObjectResult>(result);
        Assert.NotNull(ok.Value);
        Assert.Equal(business.Id, productRepository.RequestedBusinessId);
    }

    [Fact]
    public async Task UpdateProduct_RejectsAnotherBusinessProduct()
    {
        var ownerId = Guid.NewGuid();
        var product = CreateProduct(CreateBusiness(Guid.NewGuid()));
        var repository = new FakeProductRepository { Product = product };
        var controller = CreateController(ownerId, CreateBusiness(ownerId), repository);

        var result = await controller.UpdateProduct(product.Id, ValidRequest(product.Stock));

        Assert.IsType<ForbidResult>(result);
        Assert.False(repository.UpdateCalled);
    }

    [Fact]
    public async Task UpdateProduct_ReturnsConflictWhenStockChangedConcurrently()
    {
        var ownerId = Guid.NewGuid();
        var business = CreateBusiness(ownerId);
        var product = CreateProduct(business);
        var expectedStock = product.Stock;
        var repository = new FakeProductRepository { Product = product, UpdateResult = false };
        var controller = CreateController(ownerId, business, repository);

        var result = await controller.UpdateProduct(product.Id, ValidRequest(expectedStock));

        Assert.IsType<ConflictObjectResult>(result);
        Assert.Equal(expectedStock, repository.ExpectedStock);
    }

    [Fact]
    public async Task UpdateProduct_RejectsInvalidRepublishing()
    {
        var ownerId = Guid.NewGuid();
        var business = CreateBusiness(ownerId);
        var product = CreateProduct(business);
        product.IsActive = false;
        var repository = new FakeProductRepository { Product = product };
        var controller = CreateController(ownerId, business, repository);
        var request = ValidRequest(product.Stock) with { Stock = 0, IsActive = true };

        var result = await controller.UpdateProduct(product.Id, request);

        Assert.IsType<BadRequestObjectResult>(result);
        Assert.False(repository.UpdateCalled);
    }

    private static ProductsController CreateController(
        Guid ownerId,
        Business business,
        FakeProductRepository productRepository) => new(
            productRepository,
            new FakeBusinessRepository(business),
            new FakeCurrentUser(ownerId));

    private static Business CreateBusiness(Guid ownerId) => new()
    {
        Id = Guid.NewGuid(),
        OwnerId = ownerId,
        Name = "Negocio de prueba",
        District = "Miraflores"
    };

    private static Product CreateProduct(Business business) => new()
    {
        Id = Guid.NewGuid(),
        BusinessId = business.Id,
        Business = business,
        Name = "Pack",
        Category = ProductCategory.Comidas,
        Price = 10,
        OriginalPrice = 20,
        Stock = 3,
        ExpiresAt = DateTime.UtcNow.AddHours(4),
        IsActive = true
    };

    private static UpdateProductRequest ValidRequest(int expectedStock) => new(
        "Pack corregido", "Descripción", "Comidas", 11, 20,
        "https://example.com/pack.jpg", 4, DateTime.UtcNow.AddHours(5), true, expectedStock);

    private sealed class FakeCurrentUser(Guid userId) : ICurrentUserService
    {
        public Guid? UserId => userId;
        public string? Email => "owner@example.com";
        public string? Role => "owner";
        public bool IsAuthenticated => true;
    }

    private sealed class FakeBusinessRepository(Business business) : IBusinessRepository
    {
        public Task<Business?> GetByOwnerIdAsync(Guid ownerId, CancellationToken cancellationToken = default) =>
            Task.FromResult<Business?>(business.OwnerId == ownerId ? business : null);
        public Task<Business?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<IReadOnlyList<Business>> GetAllActiveAsync(CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<Business> AddAsync(Business value, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task UpdateAsync(Business value, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    }

    private sealed class FakeProductRepository : IProductRepository
    {
        public Product? Product { get; init; }
        public IReadOnlyList<Product> BusinessProducts { get; init; } = [];
        public bool UpdateResult { get; init; } = true;
        public bool UpdateCalled { get; private set; }
        public int? ExpectedStock { get; private set; }
        public Guid? RequestedBusinessId { get; private set; }

        public Task<Product?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) => Task.FromResult(Product);
        public Task<IReadOnlyList<Product>> GetByBusinessIdAsync(Guid businessId, CancellationToken cancellationToken = default)
        {
            RequestedBusinessId = businessId;
            return Task.FromResult(BusinessProducts);
        }
        public Task<bool> TryUpdateAsync(Product product, int expectedStock, CancellationToken cancellationToken = default)
        {
            UpdateCalled = true;
            ExpectedStock = expectedStock;
            return Task.FromResult(UpdateResult);
        }
        public Task<IReadOnlyList<Product>> GetAllAsync(CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<IReadOnlyList<ProductSearchResult>> SearchActiveProductsAsync(ProductSearchCriteria criteria, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task<Product> AddAsync(Product product, CancellationToken cancellationToken = default) => throw new NotImplementedException();
        public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default) => throw new NotImplementedException();
    }
}
