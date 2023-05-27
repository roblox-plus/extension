using Microsoft.AspNetCore.Authorization;
using System.Threading.Tasks;
using System.Threading;
using Microsoft.AspNetCore.Mvc;
using TixFactory.Http.Service;
using System;

namespace RobloxPlus.Main.Api;

/// <summary>
/// This controller hosts the endpoints related to authentication.
/// </summary>
[Route("api")]
public class AuthenticationController : ControllerBase
{
    private readonly IOperationExecutor _OperationExecutor;
    private readonly LoginOperation _LoginOperation;
    private readonly LogoutOperation _LogoutOperation;
    private readonly GetAuthenticatedUserOperation _GetAuthenticatedUserOperation;

    /// <summary>
    /// Initializes a new <see cref="AuthenticationController"/>.
    /// </summary>
    /// <param name="operationExecutor">The <see cref="IOperationExecutor"/>.</param>
    /// <param name="loginOperation">The <see cref="LoginOperation"/>.</param>
    /// <param name="logoutOperation">The <see cref="LogoutOperation"/>.</param>
    /// <param name="getAuthenticatedUserOperation">The <see cref="GetAuthenticatedUserOperation"/>.</param>
    /// <exception cref="ArgumentNullException">
    /// Any argument is null.
    /// </exception>
    public AuthenticationController(
        IOperationExecutor operationExecutor,
        LoginOperation loginOperation,
        LogoutOperation logoutOperation,
        GetAuthenticatedUserOperation getAuthenticatedUserOperation)
    {
        _OperationExecutor = operationExecutor ?? throw new ArgumentNullException(nameof(operationExecutor));
        _LoginOperation = loginOperation ?? throw new ArgumentNullException(nameof(loginOperation));
        _LogoutOperation = logoutOperation ?? throw new ArgumentNullException(nameof(logoutOperation));
        _GetAuthenticatedUserOperation = getAuthenticatedUserOperation ?? throw new ArgumentNullException(nameof(getAuthenticatedUserOperation));
    }
    /// <summary>
    /// Log into Roblox+ using Roblox OAuth.
    /// </summary>
    /// <param name="request">The request data, containing the authorization code.</param>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/>.</param>
    [HttpPost, Route("v1/login")]
    [AllowAnonymous]
    public Task<IActionResult> LoginAsync([FromBody] RequestPayload<string> request, CancellationToken cancellationToken)
    {
        return _OperationExecutor.ExecuteAsync(_LoginOperation, request.Data, cancellationToken);
    }

    /// <summary>
    /// Logs out of Roblox+.
    /// </summary>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/>.</param>
    [HttpPost, Route("v1/logout")]
    public Task<IActionResult> LogoutAsync(CancellationToken cancellationToken)
    {
        return _OperationExecutor.ExecuteAsync(_LogoutOperation, cancellationToken);
    }

    /// <summary>
    /// Gets the user that is currently authenticated with Roblox+.
    /// </summary>
    /// <param name="cancellationToken">A <see cref="CancellationToken"/>.</param>
    [HttpGet, Route("v1/users/authenticated")]
    public Task<IActionResult> GetAuthenticatedUserAsync(CancellationToken cancellationToken)
    {
        return _OperationExecutor.ExecuteAsync(_GetAuthenticatedUserOperation, cancellationToken);
    }
}
