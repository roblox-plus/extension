using System;
using System.Runtime.Serialization;
using Roblox.Users;

namespace RobloxPlus.Main.Api;

/// <summary>
/// The result of fetching an access token for a user.
/// </summary>
[DataContract]
internal class AuthenticationSessionResult
{
    /// <summary>
    /// The user associated with the access token.
    /// </summary>
    [DataMember(Name = "user")]
    public UserResult User { get; set; }

    /// <summary>
    /// The access token.
    /// </summary>
    [DataMember(Name = "accessToken")]
    public string AccessToken { get; set; }

    /// <summary>
    /// When the access token will expire.
    /// </summary>
    [DataMember(Name = "expiration")]
    public DateTime Expiration { get; set; }

    /// <summary>
    /// When the authentication session was created.
    /// </summary>
    [DataMember(Name = "created")]
    public DateTime Created { get; set; }
}
