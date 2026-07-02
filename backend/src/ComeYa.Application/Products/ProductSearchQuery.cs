using ComeYa.Domain.Entities;

namespace ComeYa.Application.Products;

public static class ProductSearchQuery
{
    public static IQueryable<Product> ApplyFilters(
        this IQueryable<Product> query,
        ProductSearchCriteria criteria,
        DateTime now)
    {
        query = query.Where(p => p.IsActive && p.ExpiresAt > now && p.Business.IsActive);

        if (!string.IsNullOrWhiteSpace(criteria.Query))
        {
            var term = criteria.Query.Trim().ToLower();
            query = query.Where(p =>
                p.Name.ToLower().Contains(term)
                || (p.Description != null && p.Description.ToLower().Contains(term))
                || p.Business.Name.ToLower().Contains(term));
        }

        if (criteria.Category.HasValue)
            query = query.Where(p => p.Category == criteria.Category.Value);

        if (!string.IsNullOrWhiteSpace(criteria.District))
            query = query.Where(p => p.Business.District == criteria.District);

        if (criteria.BusinessId.HasValue)
            query = query.Where(p => p.BusinessId == criteria.BusinessId.Value);

        if (criteria.MinPrice.HasValue)
            query = query.Where(p => p.Price >= criteria.MinPrice.Value);

        if (criteria.MaxPrice.HasValue)
            query = query.Where(p => p.Price <= criteria.MaxPrice.Value);

        return query;
    }

    public static IQueryable<Product> ApplyOrdering(this IQueryable<Product> query, string sort)
    {
        return sort switch
        {
            "name-asc" => query.OrderBy(p => p.Name),
            "name-desc" => query.OrderByDescending(p => p.Name),
            "price-asc" => query.OrderBy(p => p.Price).ThenBy(p => p.Name),
            "price-desc" => query.OrderByDescending(p => p.Price).ThenBy(p => p.Name),
            _ => query.OrderBy(p => p.ExpiresAt)
        };
    }
}
