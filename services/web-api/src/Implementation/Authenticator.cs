using System;
using System.Linq;
using System.Security.Claims;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.Extensions.Configuration;
using Roblox.Users;

namespace RobloxPlus.Main.Api;

/// <summary>
/// Middleware for ensuring we keep our user data up-to-date with Roblox.
/// </summary>
public class Authenticator
{
    private readonly IConfiguration _Configuration;

    /// <summary>
    /// Initializes a new <see cref="Authenticator" />.
    /// </summary>
    /// <param name="configuration">The <see cref="IConfiguration"/>.</param>
    /// <param name="httpClient">An <see cref="IHttpClient"/>.</param>
    /// <exception cref="ArgumentNullException">
    /// - <paramref name="configuration" />
    /// - <paramref name="httpClient" />
    /// </exception>
    public Authenticator(IConfiguration configuration)
    {
        _Configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    /// <summary>
    /// Validates if the authentication session is still valid with Roblox.
    /// </summary>
    /// <param name="cookieValidation">The <see cref="CookieValidatePrincipalContext"/>.</param>
    public async Task ValidateCookieAsync(CookieValidatePrincipalContext cookieValidation)
    {
        // I have no idea if this is the best or proper way to accomplish this.
        // I have no idea how I even figured out to try this method. Google? Look for posts until one looks "close enough"?
        // https://stackoverflow.com/a/38893778/1663648
        var authenticationSession = await GetAuthenticationSessionAsync(cookieValidation.Principal, cookieValidation.Properties, CancellationToken.None);
        if (authenticationSession == null)
        {
            cookieValidation.RejectPrincipal();
            await cookieValidation.HttpContext.SignOutAsync();
            return;
        }

        var currentUsername = cookieValidation.Principal?.Identity?.Name;
        cookieValidation.Properties.Items.TryGetValue(nameof(UserResult.DisplayName), out var currentDisplayName);
        cookieValidation.HttpContext.Items[nameof(AuthenticationSessionResult.User)] = authenticationSession.User;

        if (currentUsername != authenticationSession.User.Name)
        {
            var claimsIdentity = new ClaimsIdentity(new[]
            {
                new Claim(ClaimTypes.Name, authenticationSession.User.Name),
                new Claim(ClaimTypes.NameIdentifier, authenticationSession.User.Id.ToString())
            }, CookieAuthenticationDefaults.AuthenticationScheme);

            cookieValidation.ReplacePrincipal(new ClaimsPrincipal(claimsIdentity));
            cookieValidation.ShouldRenew = true;
        }

        if (currentDisplayName != authenticationSession.User.DisplayName)
        {
            cookieValidation.Properties.Items[nameof(UserResult.DisplayName)] = currentDisplayName;
            cookieValidation.ShouldRenew = true;
        }

        if (!cookieValidation.Properties.Items.TryGetValue(nameof(AuthenticationSessionResult.Created), out _))
        {
            // Cheap hack to make sure the created date gets added to the cookie.. this should really be on login, but... whatever.
            cookieValidation.Properties.Items[nameof(AuthenticationSessionResult.Created)] = authenticationSession.Created.ToString("o");
            cookieValidation.ShouldRenew = true;
        }
    }

    private async Task<AuthenticationSessionResult> GetAuthenticationSessionAsync(ClaimsPrincipal claimsPrincipal, AuthenticationProperties authenticationProperties, CancellationToken cancellationToken)
    {
        var userIdClaim = claimsPrincipal?.Claims.FirstOrDefault(c => c.Type == ClaimTypes.NameIdentifier);
        if (userIdClaim == null || !long.TryParse(userIdClaim.Value, out var userId))
        {
            return null;
        }

        // TODO: Actually validate the authentication session.
        return null;
    }
}
