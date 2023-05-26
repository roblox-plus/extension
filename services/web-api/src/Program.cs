using System.Threading.Tasks;
using TixFactory.Http.Service;

namespace RobloxPlus.Main.Api;

/// <summary>
/// The entry class for the service.
/// </summary>
public class Program
{
    /// <summary>
    /// The entry method for the service.
    /// </summary>
    /// <param name="args">The command line arguments used to start the service.</param>
    /// <returns>The exit code.</returns>
    public static Task Main(string[] args)
    {
        return TixFactory.Http.Service.Startup.Main<Startup>(args);
    }
}
