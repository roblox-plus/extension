using System;
using System.Linq;
using System.Net;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Roblox.Api;
using Roblox.Authentication;
using Roblox.Users;

namespace RobloxPlus.Main.Api;

/// <summary>
/// Middleware for ensuring we keep our user data up-to-date with Roblox.
/// </summary>
public class Authenticator : CookieAuthenticationEvents
{
    /// <summary>
    /// Time to take away from the access token expiration, before renewing.
    /// </summary>
    /// <remarks>
    /// This ensures the access token gets renewed early, so that it won't expire in the middle of the request.
    /// </remarks>
    private static readonly TimeSpan _AccessTokenExpirationLeeway = TimeSpan.FromMinutes(2);
    private readonly IAuthenticationClient _AuthenticationClient;

    /// <summary>
    /// Initializes a new <see cref="Authenticator" />.
    /// </summary>
    /// <param name="authenticationClient">An <see cref="IAuthenticationClient"/>.</param>
    /// <exception cref="ArgumentNullException">
    /// - <paramref name="authenticationClient" />
    /// </exception>
    public Authenticator(IAuthenticationClient authenticationClient)
    {
        _AuthenticationClient = authenticationClient ?? throw new ArgumentNullException(nameof(authenticationClient));
        OnRedirectToLogin = RejectWithUnauthorizedAsync;
        OnRedirectToAccessDenied = RejectWithUnauthorizedAsync;
    }

    /// <summary>
    /// Validates if the authentication session is still valid with Roblox.
    /// </summary>
    /// <remarks>
    /// https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie?view=aspnetcore-7.0
    /// </remarks>
    /// <param name="cookieValidationContext">The <see cref="CookieValidatePrincipalContext"/>.</param>
    public override async Task ValidatePrincipal(CookieValidatePrincipalContext cookieValidationContext)
    {
        var username = cookieValidationContext.Principal?.Identity?.Name;
        if (string.IsNullOrWhiteSpace(username)
            || !TryGetClaim(cookieValidationContext.Principal, ClaimTypes.NameIdentifier, out var rawUserId)
            || !long.TryParse(rawUserId, out var userId)
            || !cookieValidationContext.Properties.Items.TryGetValue(nameof(UserResult.DisplayName), out var displayName)
            || !cookieValidationContext.Properties.Items.TryGetValue(nameof(LoginResult.AccessToken), out var accessToken)
            || !cookieValidationContext.Properties.Items.TryGetValue(nameof(LoginResult.RefreshToken), out var refreshToken)
            || !cookieValidationContext.Properties.Items.TryGetValue(nameof(LoginResult.AccessTokenExpiration), out var rawAccessTokenExpiration)
            || !DateTime.TryParse(rawAccessTokenExpiration, out var accessTokenExpiration))
        {
            await Logout(cookieValidationContext);
            return;
        }

        if (accessTokenExpiration - _AccessTokenExpirationLeeway < DateTime.UtcNow)
        {
            // Access token needs to be refreshed.
            try
            {
                // Refresh required.
                var refreshResult = await _AuthenticationClient.RefreshAsync(refreshToken, CancellationToken.None);

                // Update cookie
                PopulateAuthenticationProperties(cookieValidationContext.Properties, refreshResult);
                cookieValidationContext.ReplacePrincipal(CreateClaims(refreshResult));
                cookieValidationContext.ShouldRenew = true;

                // Ensure the user information is available for the running request.
                cookieValidationContext.HttpContext.Items[nameof(LoginResult.User)] = refreshResult.User;
            }
            catch (RobloxUnauthenticatedException)
            {
                // User could have denied access to the app externally.
                await Logout(cookieValidationContext);
            }
        }
        else
        {
            // Nothing to refresh right now, just ensure the user information is available for the running request.
            cookieValidationContext.HttpContext.Items[nameof(LoginResult.User)] = new UserResult
            {
                Id = userId,
                Name = username,
                DisplayName = displayName
            };
        }
    }

    /// <summary>
    /// Creates a <see cref="ClaimsPrincipal"/> from a <see cref="LoginResult"/>.
    /// </summary>
    /// <param name="loginResult">The <see cref="LoginResult"/>.</param>
    /// <returns>The <see cref="ClaimsPrincipal"/>.</returns>
    public ClaimsPrincipal CreateClaims(LoginResult loginResult)
    {
        var claims = new ClaimsIdentity(new[]
        {
            new Claim(ClaimTypes.Name, loginResult.User.Name),
            new Claim(ClaimTypes.NameIdentifier, loginResult.User.Id.ToString())
        }, CookieAuthenticationDefaults.AuthenticationScheme);

        return new ClaimsPrincipal(claims);
    }

    /// <summary>
    /// Populates an <see cref="AuthenticationProperties"/> based on a <see cref="LoginResult"/>.
    /// </summary>
    /// <param name="authenticationProperties">The <see cref="AuthenticationProperties"/>.</param>
    /// <param name="loginResult">The <see cref="LoginResult"/>.</param>
    public void PopulateAuthenticationProperties(AuthenticationProperties authenticationProperties, LoginResult loginResult)
    {
        authenticationProperties.Items[nameof(UserResult.DisplayName)] = loginResult.User.DisplayName;
        authenticationProperties.Items[nameof(LoginResult.AccessToken)] = loginResult.AccessToken;
        authenticationProperties.Items[nameof(LoginResult.RefreshToken)] = loginResult.RefreshToken;
        authenticationProperties.Items[nameof(LoginResult.AccessTokenExpiration)] = loginResult.AccessTokenExpiration.ToString("o");
        authenticationProperties.Items[nameof(LoginResult.Scopes)] = loginResult.RawScopes;
    }

    private Task Logout(CookieValidatePrincipalContext cookieValidationContext)
    {
        cookieValidationContext.RejectPrincipal();
        return cookieValidationContext.HttpContext.SignOutAsync();
    }

    private bool TryGetClaim(ClaimsPrincipal claimsPrincipal, string claimType, out string value)
    {
        var claim = claimsPrincipal?.Claims.FirstOrDefault(c => c.Type == claimType);
        value = claim?.Value;
        return !string.IsNullOrWhiteSpace(value);
    }

    private Task RejectWithUnauthorizedAsync(RedirectContext<CookieAuthenticationOptions> redirectContext)
    {
        // https://stackoverflow.com/a/65388846/1663648
        redirectContext.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
        return redirectContext.Response.CompleteAsync();
    }
}
