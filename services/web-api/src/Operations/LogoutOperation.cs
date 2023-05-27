using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using TixFactory.Operations;

namespace RobloxPlus.Main.Api;

/// <summary>
/// Operation to log user out of Roblox+ via Roblox OAuth.
/// </summary>
public class LogoutOperation : IAsyncAction
{
    private readonly IHttpContextAccessor _HttpContextAccessor;

    /// <summary>
    /// Initializes a new <see cref="LogoutOperation"/>.
    /// </summary>
    /// <param name="httpContextAccessor">The <see cref="IHttpContextAccessor"/>.</param>
    /// <exception cref="ArgumentNullException">
    /// - <paramref name="httpContextAccessor"/>
    /// </exception>
    public LogoutOperation(IHttpContextAccessor httpContextAccessor)
    {
        _HttpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    /// <inheritdoc cref="IAsyncAction{TInput}.ExecuteAsync"/>
    public async Task<OperationError> ExecuteAsync(CancellationToken cancellationToken)
    {
        var httpContext = _HttpContextAccessor.HttpContext;
        if (httpContext != null)
        {
            await httpContext.SignOutAsync();
        }

        return null;
    }
}
