using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using Roblox.Users;
using TixFactory.Operations;

namespace RobloxPlus.Main.Api;

/// <summary>
/// Operation to log user into Roblox+ via Roblox OAuth.
/// </summary>
public class LoginOperation : IAsyncOperation<string, UserResult>
{
    private readonly IAuthenticationService _AuthenticationService;
    private readonly IHttpContextAccessor _HttpContextAccessor;

    /// <summary>
    /// Initializes a new <see cref="LoginOperation"/>.
    /// </summary>
    /// <param name="authenticationService">The <see cref="IAuthenticationService"/>.</param>
    /// <param name="httpContextAccessor">The <see cref="IHttpContextAccessor"/>.</param>
    /// <exception cref="ArgumentNullException">
    /// - <paramref name="authenticationService"/>
    /// - <paramref name="httpContextAccessor"/>
    /// </exception>
    public LoginOperation(IAuthenticationService authenticationService, IHttpContextAccessor httpContextAccessor)
    {
        _AuthenticationService = authenticationService ?? throw new ArgumentNullException(nameof(authenticationService));
        _HttpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
    }

    /// <inheritdoc cref="IAsyncOperation{TInput,TOutput}.ExecuteAsync"/>
    public async Task<(UserResult Output, OperationError Error)> ExecuteAsync(string code, CancellationToken cancellationToken)
    {
        /*
        var user = await LoginAsync(code, cancellationToken);

        var claimsIdentity = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Name, user.Name),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        }, CookieAuthenticationDefaults.AuthenticationScheme);

        var authenticationProperties = new AuthenticationProperties(new Dictionary<string, string>
        {
            [nameof(UserResult.DisplayName)] = user.DisplayName
        });

        await _AuthenticationService.SignInAsync(
            _HttpContextAccessor.HttpContext,
            CookieAuthenticationDefaults.AuthenticationScheme,
            new ClaimsPrincipal(claimsIdentity),
            authenticationProperties);

        return (user, null);
        */
        throw new NotImplementedException();
    }
}
