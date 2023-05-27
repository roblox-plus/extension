using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Roblox.Authentication;
using Roblox.Users;
using TixFactory.Operations;

namespace RobloxPlus.Main.Api;

/// <summary>
/// Operation to fetch authenticated user session.
/// </summary>
public class GetAuthenticatedUserOperation : IAsyncOperation<UserResult>
{
    private readonly IHttpContextAccessor _HttpContextAccessor;

    /// <summary>
    /// Initializes a new <see cref="GetAuthenticatedUserOperation"/>.
    /// </summary>
    /// <param name="httpContextAccessor">The <see cref="IHttpContextAccessor"/>.</param>
    /// <exception cref="ArgumentNullException">
    /// - <paramref name="httpContextAccessor"/>
    /// </exception>
    public GetAuthenticatedUserOperation(IHttpContextAccessor httpContextAccessor)
    {
        _HttpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    /// <inheritdoc cref="IAsyncOperation{TInput,TOutput}.ExecuteAsync"/>
    public async Task<(UserResult Output, OperationError Error)> ExecuteAsync(CancellationToken cancellationToken)
    {
        var httpContext = _HttpContextAccessor.HttpContext;
        if (httpContext?.Items.TryGetValue(nameof(LoginResult.User), out var rawUser) != true
            || !(rawUser is UserResult user))
        {
            if (httpContext != null)
            {
                await httpContext.SignOutAsync();
            }

            return (null, null);
        }

        return (user, null);
    }
}
