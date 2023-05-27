using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Roblox.Authentication;
using Roblox.Thumbnails;
using Roblox.Users;
using TixFactory.Operations;

namespace RobloxPlus.Main.Api;

/// <summary>
/// Operation to fetch the thumbnail for the authenticated user session.
/// </summary>
public class GetAuthenticatedUserThumbnailOperation : IAsyncOperation<ThumbnailResult>
{
    private readonly IHttpContextAccessor _HttpContextAccessor;
    private readonly IThumbnailsClient _ThumbnailsClient;

    /// <summary>
    /// Initializes a new <see cref="GetAuthenticatedUserThumbnailOperation"/>.
    /// </summary>
    /// <param name="httpContextAccessor">The <see cref="IHttpContextAccessor"/>.</param>
    /// <param name="thumbnailsClient">The <see cref="IThumbnailsClient"/>.</param>
    /// <exception cref="ArgumentNullException">
    /// - <paramref name="httpContextAccessor"/>
    /// - <paramref name="thumbnailsClient"/>
    /// </exception>
    public GetAuthenticatedUserThumbnailOperation(IHttpContextAccessor httpContextAccessor, IThumbnailsClient thumbnailsClient)
    {
        _HttpContextAccessor = httpContextAccessor ?? throw new ArgumentNullException(nameof(httpContextAccessor));
        _ThumbnailsClient = thumbnailsClient ?? throw new ArgumentNullException(nameof(thumbnailsClient));
    }

    /// <inheritdoc cref="IAsyncOperation{TInput,TOutput}.ExecuteAsync"/>
    public async Task<(ThumbnailResult Output, OperationError Error)> ExecuteAsync(CancellationToken cancellationToken)
    {
        var httpContext = _HttpContextAccessor.HttpContext;
        if (httpContext?.Items.TryGetValue(nameof(LoginResult.User), out var rawUser) != true
            || !(rawUser is UserResult user))
        {
            // This should.. never happen.
            return (new ThumbnailResult
            {
                State = ThumbnailState.Error,
                ImageUrl = null
            }, null);
        }

        var thumbnail = await _ThumbnailsClient.GetUserHeadShotThumbnailAsync(user.Id, cancellationToken);
        return (thumbnail, null);
    }
}
