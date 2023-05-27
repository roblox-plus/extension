using System;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Authorization;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json.Converters;
using Roblox.Api;
using TixFactory.ApplicationContext;

namespace RobloxPlus.Main.Api;

/// <inheritdoc cref="TixFactory.Http.Service.Startup"/>
public class Startup : TixFactory.Http.Service.Startup
{
    /// <summary>
    /// How long authentication sessions last.
    /// </summary>
    /// <remarks>
    /// Only needs to last 6 months, because the refresh token will expire by then.
    /// </remarks>
    private static readonly TimeSpan _CookieExpiry = TimeSpan.FromDays(30 * 6);
    private readonly IConfiguration _Configuration;
    private IApplicationBuilder _App;

    /// <summary>
    /// Initializes a new <see cref="Startup"/>.
    /// </summary>
    /// <param name="configuration">The <see cref="IConfiguration"/>.</param>
    /// <exception cref="ArgumentNullException">
    /// - <paramref name="configuration"/>
    /// </exception>
    public Startup(IConfiguration configuration)
    {
        _Configuration = configuration ?? throw new ArgumentNullException(nameof(configuration));
    }

    /// <summary>
    /// Startup method for the application, after <see cref="ConfigureServices"/>.
    /// </summary>
    /// <param name="app">The <see cref="IApplicationBuilder"/>.</param>
    public void Configure(IApplicationBuilder app)
    {
        _App = app;
        UseConfiguration(app);
    }

    /// <inheritdoc cref="TixFactory.Http.Service.Startup.ConfigureServices"/>
    public override void ConfigureServices(IServiceCollection services)
    {
        base.ConfigureServices(services);

        // Authentication
        services.AddDataProtection()
            .SetApplicationName(ApplicationContext.Singleton.Name)
            .AddKeyManagementOptions(options =>
            {
                options.XmlRepository = new AuthenticationKeyStore(_Configuration);
            });

        services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            options.DefaultSignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
            options.DefaultSignOutScheme = CookieAuthenticationDefaults.AuthenticationScheme;
        }).AddCookie(options =>
        {
            options.Cookie.Name = ".ROBLOXPLUS.NET.AUTHENTICATION";
            options.Cookie.HttpOnly = true;
            options.Cookie.MaxAge = _CookieExpiry;
            options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
            options.Cookie.SameSite = SameSiteMode.None;
            options.SlidingExpiration = true;

            options.ExpireTimeSpan = _CookieExpiry;
            options.LoginPath = "/login";
            options.LogoutPath = "/logout";
            options.EventsType = typeof(Authenticator);

            options.Validate();
        });

        services.AddSingleton<Authenticator>();
        services.AddAuthorization();

        // Dependencies
        services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
        services.AddRobloxClients();

        // Operations
        services.AddTransient<LoginOperation>();
        services.AddTransient<LogoutOperation>();
        services.AddTransient<GetAuthenticatedUserOperation>();
    }

    /// <inheritdoc cref="TixFactory.Http.Service.Startup.ConfigureMvc"/>
    protected override void ConfigureMvc(MvcOptions options)
    {
        // Require authenticated user on all endpoints, unless explicitly opted to be anonymous.
        var authorizationPolicyBuilder = new AuthorizationPolicyBuilder()
            .RequireAuthenticatedUser();
        authorizationPolicyBuilder.AuthenticationSchemes.Add(CookieAuthenticationDefaults.AuthenticationScheme);
        options.Filters.Add(new AuthorizeFilter(authorizationPolicyBuilder.Build()));

        base.ConfigureMvc(options);
    }

    /// <inheritdoc cref="TixFactory.Http.Service.Startup.ConfigureEndpoints"/>
    protected override void ConfigureEndpoints(IEndpointRouteBuilder endpointBuilder)
    {
        _App.UseCors();
        _App.UseAuthentication();
        _App.UseAuthorization();

        base.ConfigureEndpoints(endpointBuilder);
    }

    /// <inheritdoc cref="TixFactory.Http.Service.Startup.ConfigureJson"/>
    protected override void ConfigureJson(MvcNewtonsoftJsonOptions options)
    {
        options.SerializerSettings.Converters.Add(new StringEnumConverter());
    }
}
