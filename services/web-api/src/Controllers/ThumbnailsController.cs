using System;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using TixFactory.Http.Service;

namespace RobloxPlus.Main.Api.Controllers;

/// <summary>
/// The controller for accessing Roblox thumbnails
/// </summary>
[Route("api")]
public class ThumbnailsController : ControllerBase
{
    private readonly IOperationExecutor _OperationExecutor;
    private readonly GetAuthenticatedUserThumbnailOperation _GetAuthenticatedUserThumbnailOperation;

    /// <summary>
    /// Initializes a new <see cref="ThumbnailsController"/>.
    /// </summary>
    /// <param name="operationExecutor">The <see cref="IOperationExecutor"/>.</param>
    /// <param name="getAuthenticatedUserThumbnailOperation">The <see cref="GetAuthenticatedUserThumbnailOperation"/>.</param>
    /// <exception cref="ArgumentNullException">
    /// Any argument is null.
    /// </exception>
    public ThumbnailsController(
        IOperationExecutor operationExecutor,
        GetAuthenticatedUserThumbnailOperation getAuthenticatedUserThumbnailOperation)
    {
        _OperationExecutor = operationExecutor ?? throw new ArgumentNullException(nameof(operationExecutor));
        _GetAuthenticatedUserThumbnailOperation = getAuthenticatedUserThumbnailOperation ?? throw new ArgumentNullException(nameof(getAuthenticatedUserThumbnailOperation));
    }

    /// <summary>
    /// Gets the thumbnail for the authenticated user.
    /// </summary>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/>.</param>
    [HttpGet, Route("v1/users/authenticated/thumbnail")]
    public Task<IActionResult> GetAuthenticatedUserAsync(CancellationToken cancellationToken)
    {
        return _OperationExecutor.ExecuteAsync(_GetAuthenticatedUserThumbnailOperation, cancellationToken);
    }
}
