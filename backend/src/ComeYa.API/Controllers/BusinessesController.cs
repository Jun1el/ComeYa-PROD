using ComeYa.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComeYa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BusinessesController : ControllerBase
{
    private readonly IBusinessRepository _businessRepository;
    private readonly ICurrentUserService _currentUser;

    public BusinessesController(IBusinessRepository businessRepository, ICurrentUserService currentUser)
    {
        _businessRepository = businessRepository;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetBusinesses()
    {
        var businesses = await _businessRepository.GetAllActiveAsync();
        
        var result = businesses.Select(b => new
        {
            b.Id,
            b.Name,
            b.Description,
            b.District,
            b.Address,
            b.Phone,
            b.LogoUrl,
            b.Rating,
            b.TotalRatings,
            ProductsCount = b.Products?.Count(p => p.IsActive && p.ExpiresAt > DateTime.UtcNow) ?? 0
        });

        return Ok(result);
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetBusiness(Guid id)
    {
        var business = await _businessRepository.GetByIdAsync(id);
        if (business == null)
            return NotFound();

        return Ok(new
        {
            business.Id,
            business.Name,
            business.Description,
            business.District,
            business.Address,
            business.Phone,
            business.LogoUrl,
            business.Rating,
            business.TotalRatings,
            Products = business.Products?
                .Where(p => p.IsActive && p.ExpiresAt > DateTime.UtcNow)
                .Select(p => new
                {
                    p.Id,
                    p.Name,
                    p.Description,
                    Category = p.Category.ToString(),
                    p.Price,
                    p.OriginalPrice,
                    p.ImageUrl,
                    p.Stock,
                    p.ExpiresAt,
                    p.DiscountPercentage
                })
        });
    }

    [Authorize]
    [HttpGet("my-business")]
    public async Task<IActionResult> GetMyBusiness()
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var business = await _businessRepository.GetByOwnerIdAsync(userId.Value);
        if (business == null)
            return NotFound(new { Message = "No tienes un negocio registrado" });

        return Ok(new
        {
            business.Id,
            business.Name,
            business.Description,
            business.District,
            business.Address,
            business.Phone,
            business.LogoUrl,
            business.Rating,
            business.TotalRatings,
            business.IsActive,
            Products = business.Products?.Select(p => new
            {
                p.Id,
                p.Name,
                p.Description,
                Category = p.Category.ToString(),
                p.Price,
                p.OriginalPrice,
                p.ImageUrl,
                p.Stock,
                p.ExpiresAt,
                p.IsActive,
                p.DiscountPercentage
            })
        });
    }

    [Authorize]
    [HttpPost]
    public async Task<IActionResult> CreateBusiness([FromBody] CreateBusinessRequest request)
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var existing = await _businessRepository.GetByOwnerIdAsync(userId.Value);
        if (existing != null)
            return BadRequest(new { Message = "Ya tienes un negocio registrado" });

        var business = new Domain.Entities.Business
        {
            OwnerId = userId.Value,
            Name = request.Name,
            Description = request.Description,
            District = request.District,
            Address = request.Address,
            Phone = request.Phone,
            LogoUrl = request.LogoUrl
        };

        var created = await _businessRepository.AddAsync(business);
        return CreatedAtAction(nameof(GetBusiness), new { id = created.Id }, created);
    }

    [Authorize]
    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateBusiness(Guid id, [FromBody] UpdateBusinessRequest request)
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var business = await _businessRepository.GetByIdAsync(id);
        if (business == null)
            return NotFound();

        if (business.OwnerId != userId)
            return Forbid();

        if (!string.IsNullOrEmpty(request.Name))
            business.Name = request.Name;
        if (request.Description != null)
            business.Description = request.Description;
        if (request.Address != null)
            business.Address = request.Address;
        if (request.Phone != null)
            business.Phone = request.Phone;
        if (request.LogoUrl != null)
            business.LogoUrl = request.LogoUrl;

        await _businessRepository.UpdateAsync(business);
        return NoContent();
    }
}

public record CreateBusinessRequest(
    string Name,
    string? Description,
    string District,
    string? Address,
    string? Phone,
    string? LogoUrl
);

public record UpdateBusinessRequest(
    string? Name,
    string? Description,
    string? Address,
    string? Phone,
    string? LogoUrl
);
