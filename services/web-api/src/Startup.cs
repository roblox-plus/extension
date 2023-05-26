using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Converters;

namespace RobloxPlus.Main.Api;

/// <inheritdoc cref="TixFactory.Http.Service.Startup"/>
public class Startup : TixFactory.Http.Service.Startup
{
    /// <summary>
    /// Startup method for the application, after <see cref="ConfigureServices"/>.
    /// </summary>
    /// <param name="app">The <see cref="IApplicationBuilder"/>.</param>
    public void Configure(IApplicationBuilder app)
    {
        UseConfiguration(app);
    }

    /// <inheritdoc cref="TixFactory.Http.Service.Startup.ConfigureServices"/>
    public override void ConfigureServices(IServiceCollection services)
    {
        base.ConfigureServices(services);

    }

    /// <inheritdoc cref="TixFactory.Http.Service.Startup.ConfigureJson"/>
    protected override void ConfigureJson(MvcNewtonsoftJsonOptions options)
    {
        options.SerializerSettings.Converters.Add(new StringEnumConverter());
    }
}
