using System;
using System.Collections.Generic;
using System.Collections.Immutable;
using System.Linq;
using System.Text;
using System.Xml.Linq;
using Microsoft.AspNetCore.DataProtection.Repositories;
using Microsoft.Extensions.Configuration;
using Newtonsoft.Json;

namespace RobloxPlus.Main.Api;

/// <summary>
/// File based data protection key store.
/// </summary>
public class AuthenticationKeyStore : IXmlRepository
{
    private readonly IConfiguration _Configuration;

    /// <summary>
    /// Initializes a new <see cref="AuthenticationKeyStore"/>.
    /// </summary>
    /// <param name="configuration"></param>
    /// <exception cref="ArgumentNullException">
    /// - <paramref name="configuration"/>
    /// </exception>
    public AuthenticationKeyStore(IConfiguration configuration)
    {
        _Configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    /// <inheritdoc cref="IXmlRepository.GetAllElements"/>
    public IReadOnlyCollection<XElement> GetAllElements()
    {
        var storedKeys = GetStoredKeys();
        return storedKeys.Values.ToArray();
    }

    /// <inheritdoc cref="IXmlRepository.StoreElement"/>
    public void StoreElement(XElement element, string friendlyName)
    {
        /*
        var storedKeys = GetStoredKeys().ToDictionary(k => k.Key, v => v.Value);
        storedKeys[friendlyName] = element;

        var authenticationKeys = new Dictionary<string, string>();
        foreach (var (name, key) in storedKeys)
        {
            var keyBytes = Encoding.UTF8.GetBytes(key.ToString(SaveOptions.DisableFormatting));
            authenticationKeys[name] = Convert.ToBase64String(keyBytes);
        }

        File.WriteAllText(_AuthenticationKeysFileName, JsonConvert.SerializeObject(authenticationKeys));
        */
        throw new NotImplementedException();
    }

    private IReadOnlyDictionary<string, XElement> GetStoredKeys()
    {
        try
        {
            var authenticationKeys = JsonConvert.DeserializeObject<Dictionary<string, string>>(_Configuration.GetValue<string>("AUTHENTICATION_KEYS_JSON"));

            var storedKeys = new Dictionary<string, XElement>();
            foreach (var (friendlyName, encodedXml) in authenticationKeys)
            {
                var xmlBytes = Convert.FromBase64String(encodedXml);
                var xElement = XElement.Parse(Encoding.UTF8.GetString(xmlBytes));
                storedKeys.Add(friendlyName, xElement);
            }

            return storedKeys;
        }
        catch (Exception)
        {
            return ImmutableDictionary<string, XElement>.Empty;
        }
    }
}
