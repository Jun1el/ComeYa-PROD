using ComeYa.Application.Common.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ComeYa.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProfileController : ControllerBase
{
    private readonly IProfileRepository _profileRepository;
    private readonly ICurrentUserService _currentUser;

    public ProfileController(IProfileRepository profileRepository, ICurrentUserService currentUser)
    {
        _profileRepository = profileRepository;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<IActionResult> GetProfile()
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var profile = await _profileRepository.GetByIdAsync(userId.Value);
        if (profile == null)
            return NotFound();

        return Ok(new
        {
            profile.Id,
            profile.Email,
            profile.FullName,
            profile.Role,
            profile.District,
            profile.Membership,
            profile.MembershipDate,
            profile.BusinessName,
            profile.BusinessPhone,
            profile.AvatarUrl,
            profile.CreatedAt,
            Stats = profile.Stats != null ? new
            {
                profile.Stats.MealsRescued,
                profile.Stats.MoneySaved,
                profile.Stats.Co2Avoided,
                profile.Stats.TotalOrders
            } : null
        });
    }

    [HttpPut]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var profile = await _profileRepository.GetByIdAsync(userId.Value);
        if (profile == null)
            return NotFound();

        if (!string.IsNullOrEmpty(request.FullName))
            profile.FullName = request.FullName;
        if (request.District != null)
            profile.District = request.District;
        if (request.BusinessPhone != null)
            profile.BusinessPhone = request.BusinessPhone;
        if (request.AvatarUrl != null)
            profile.AvatarUrl = request.AvatarUrl;

        await _profileRepository.UpdateAsync(profile);
        return NoContent();
    }

    [HttpPost("upgrade-premium")]
    public async Task<IActionResult> UpgradeToPremium()
    {
        var userId = _currentUser.UserId;
        if (userId == null)
            return Unauthorized();

        var profile = await _profileRepository.GetByIdAsync(userId.Value);
        if (profile == null)
            return NotFound();

        if (profile.Membership == Domain.Enums.Membership.Premium)
            return BadRequest(new { Message = "Ya eres miembro Premium" });

        profile.Membership = Domain.Enums.Membership.Premium;
        profile.MembershipDate = DateTime.UtcNow;
        await _profileRepository.UpdateAsync(profile);

        return Ok(new { Message = "¡Bienvenido a Premium!" });
    }
}

public record UpdateProfileRequest(
    string? FullName,
    string? District,
    string? BusinessPhone,
    string? AvatarUrl
);
