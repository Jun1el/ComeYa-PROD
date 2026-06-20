using ComeYa.Application.Common.Interfaces;
using ComeYa.Infrastructure.Auth;
using ComeYa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;

namespace ComeYa.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();

        var connectionString = configuration.GetConnectionString("Supabase");
        
        if (!string.IsNullOrEmpty(connectionString))
        {
            services.AddDbContext<ComeYaDbContext>(options =>
                options.UseNpgsql(connectionString));
        }

        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IProfileRepository, ProfileRepository>();
        services.AddScoped<IBusinessRepository, BusinessRepository>();

        return services;
    }
}
