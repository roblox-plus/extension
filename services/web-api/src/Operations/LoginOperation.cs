using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Roblox.Authentication;
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
    private readonly IAuthenticationClient _AuthenticationClient;
    private readonly Authenticator _Authenticator;

    /// <summary>
    /// Initializes a new <see cref="LoginOperation"/>.
    /// </summary>
    /// <param name="authenticationService">The <see cref="IAuthenticationService"/>.</param>
    /// <param name="httpContextAccessor">The <see cref="IHttpContextAccessor"/>.</param>
    /// <param name="authenticationClient">The <see cref="IAuthenticationClient"/>.</param>
    /// <param name="authenticator">The <see cref="Authenticator"/>.</param>
    /// <exception cref="ArgumentNullException">
    /// - <paramref name="authenticationService"/>
    /// - <paramref name="httpContextAccessor"/>
    /// - <paramref name="authenticationClient"/>
    /// - <paramref name="authenticator"/>
    /// </exception>
    public LoginOperation(
        IAuthenticationService authenticationService,
        IHttpContextAccessor httpContextAccessor,
        IAuthenticationClient authenticationClient,
        Authenticator authenticator)
    {
        _AuthenticationService = authenticationService ?? throw new ArgumentNullException(nameof(authenticationService));
        _HttpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        _AuthenticationClient = authenticationClient ?? throw new ArgumentNullException(nameof(authenticationClient));
        _Authenticator = authenticator ?? throw new ArgumentNullException(nameof(authenticator));
    }

    /// <inheritdoc cref="IAsyncOperation{TInput,TOutput}.ExecuteAsync"/>
    public async Task<(UserResult Output, OperationError Error)> ExecuteAsync(string code, CancellationToken cancellationToken)
    {
        var loginResult = await _AuthenticationClient.LoginAsync(code, cancellationToken);

        var authenticationProperties = new AuthenticationProperties();
        _Authenticator.PopulateAuthenticationProperties(authenticationProperties, loginResult);

        await _AuthenticationService.SignInAsync(
            _HttpContextAccessor.HttpContext,
            CookieAuthenticationDefaults.AuthenticationScheme,
            _Authenticator.CreateClaims(loginResult),
            authenticationProperties);

        return (loginResult.User, null);
    }
}
