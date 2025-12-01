using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Data;
using backend.DTOs;
using backend.Middleware;
using backend.Services;

namespace backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            LoadEnvFile();

            var builder = WebApplication.CreateBuilder(args);

            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddDbContext<AppDbContext>(options =>
            {
                var connectionString = GetConnectionString(builder.Configuration);
                options.UseNpgsql(connectionString, npgsqlOptions =>
                {
                    npgsqlOptions.EnableRetryOnFailure(3, TimeSpan.FromSeconds(5), null);
                });

                if (builder.Environment.IsDevelopment())
                {
                    options.EnableSensitiveDataLogging();
                    options.EnableDetailedErrors();
                }
            });

            builder.Services.AddSingleton<IKeyVaultService, EnvironmentKeyVaultService>();

            builder.Services.AddScoped<ITokenService, TokenService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IGoogleAuthService, GoogleAuthService>();
            builder.Services.AddScoped<ITaskService, TaskService>();
            builder.Services.AddScoped<IKeyVaultService, EnvironmentKeyVaultService>();
            builder.Services.AddScoped<IScheduleAnalysisRepository, ScheduleAnalysisRepository>();
            builder.Services.AddScoped<IScheduleAnalysisService, ScheduleAnalysisService>();
            builder.Services.AddHttpClient<IOpenRouterService, OpenRouterService>();

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer = null,
                        ValidAudience = null,
                        IssuerSigningKey = null
                    };

                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = async context =>
                        {
                            var keyVault = context.HttpContext.RequestServices.GetRequiredService<IKeyVaultService>();

                            var secret = await keyVault.GetJwtSecretAsync();
                            var issuer = await keyVault.GetJwtIssuerAsync();
                            var audience = await keyVault.GetJwtAudienceAsync();

                            if (!string.IsNullOrEmpty(secret))
                            {
                                context.Options.TokenValidationParameters.IssuerSigningKey =
                                    new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
                            }

                            if (!string.IsNullOrEmpty(issuer))
                            {
                                context.Options.TokenValidationParameters.ValidIssuer = issuer;
                            }

                            if (!string.IsNullOrEmpty(audience))
                            {
                                context.Options.TokenValidationParameters.ValidAudience = audience;
                            }

                            await Task.CompletedTask;
                        }
                    };
                });

            builder.Services.AddAuthorization();
            builder.Services.AddOpenApi();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAll", policy =>
                {
                    policy.AllowAnyOrigin()
                        .AllowAnyHeader()
                        .AllowAnyMethod();
                });
            });

            var app = builder.Build();

            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.MapGet("/health", () => Results.Ok(new
            {
                status = "Healthy",
                timestamp = DateTime.UtcNow,
                environment = app.Environment.EnvironmentName,
                database = "PostgreSQL"
            }));

            ApplyMigrations(app);

            app.UseMiddleware<ExceptionHandlingMiddleware>();
            app.UseCors("AllowAll");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            builder.WebHost.UseUrls("http://0.0.0.0:8080");
            app.Run();
        }

        private static void LoadEnvFile()
        {
            var envFilePath = Path.Combine(Directory.GetParent(Directory.GetCurrentDirectory()).FullName, ".env");
            if (File.Exists(envFilePath))
            {
                foreach (var line in File.ReadAllLines(envFilePath))
                {
                    var parts = line.Split('=', 2);
                    if (parts.Length == 2 && !string.IsNullOrEmpty(parts[0]) && !parts[0].StartsWith("#"))
                    {
                        Environment.SetEnvironmentVariable(parts[0].Trim(), parts[1].Trim());
                    }
                }
            }
        }

        private static string GetConnectionString(IConfiguration configuration)
        {
            if (!string.IsNullOrEmpty(Environment.GetEnvironmentVariable("POSTGRES_DB")))
            {
                var db = Environment.GetEnvironmentVariable("POSTGRES_DB");
                var user = Environment.GetEnvironmentVariable("POSTGRES_USER");
                var password = Environment.GetEnvironmentVariable("POSTGRES_PASSWORD");
                return $"Host=postgres;Port=5432;Database={db};Username={user};Password={password}";
            }

            return configuration.GetConnectionString("DefaultConnection")
                ?? "Host=localhost;Port=5432;Database=backend;Username=postgres;Password=postgres";
        }

        private static void ApplyMigrations(WebApplication app)
        {
            using var scope = app.Services.CreateScope();
            var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
            var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();

            try
            {
                logger.LogInformation("Applying database migrations...");

                var pendingMigrations = dbContext.Database.GetPendingMigrations();
                if (pendingMigrations.Any())
                {
                    logger.LogInformation("Applying {Count} pending migrations...", pendingMigrations.Count());
                    dbContext.Database.Migrate();
                    logger.LogInformation("Migrations applied successfully");
                }
                else
                {
                    logger.LogInformation("No pending migrations");
                }
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "An error occurred while applying migrations");
            }
        }
    }
}
