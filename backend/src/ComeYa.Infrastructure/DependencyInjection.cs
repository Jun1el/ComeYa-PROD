using ComeYa.Application.Common.Interfaces;
using ComeYa.Infrastructure.Auth;
using ComeYa.Infrastructure.Persistence;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Npgsql;

namespace ComeYa.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        services.AddHttpContextAccessor();

        var connectionString = configuration.GetConnectionString("Supabase");
        
        if (!string.IsNullOrEmpty(connectionString))
        {
            var connectionBuilder = new NpgsqlConnectionStringBuilder(connectionString);

            // La API de Render/.NET mantiene conexiones persistentes. El puerto
            // 5432 del pooler usa modo sesión y evita respuestas colgadas que
            // pueden ocurrir al reutilizar el pooler transaccional (6543).
            if (connectionBuilder.Port == 6543 &&
                connectionBuilder.Host?.Contains(
                    "pooler.supabase.com",
                    StringComparison.OrdinalIgnoreCase) == true)
            {
                connectionBuilder.Port = 5432;
            }

            connectionBuilder.Timeout = Math.Min(connectionBuilder.Timeout, 10);
            connectionBuilder.CommandTimeout = Math.Min(connectionBuilder.CommandTimeout, 20);
            connectionBuilder.KeepAlive = 10;
            connectionBuilder.ApplicationName = "ComeYa.API";

            services.AddDbContext<ComeYaDbContext>(options =>
                options.UseNpgsql(
                    connectionBuilder.ConnectionString,
                    npgsqlOptions => npgsqlOptions.EnableRetryOnFailure(
                        maxRetryCount: 1,
                        maxRetryDelay: TimeSpan.FromSeconds(1),
                        errorCodesToAdd: null)));
        }

        services.AddScoped<ICurrentUserService, CurrentUserService>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<IOrderRepository, OrderRepository>();
        services.AddScoped<IProfileRepository, ProfileRepository>();
        services.AddScoped<IBusinessRepository, BusinessRepository>();

        return services;
    }
}
