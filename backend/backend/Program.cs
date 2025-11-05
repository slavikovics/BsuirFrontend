using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using backend.Data;
using backend.Middleware;
using backend.Services;

namespace backend
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();

            // Database
            builder.Services.AddDbContext<AppDbContext>(options =>
                options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

            // Key Vault Service (выбираем в зависимости от окружения)
            if (builder.Environment.IsProduction())
            {
                // Для продакшена используем Azure Key Vault
                builder.Services.AddSingleton<IKeyVaultService, EnvironmentKeyVaultService>();
            }
            else
            {
                // Для разработки используем Environment Variables или конфигурацию
                builder.Services.AddSingleton<IKeyVaultService, EnvironmentKeyVaultService>();
            }

            // Services
            builder.Services.AddScoped<ITokenService, TokenService>();
            builder.Services.AddScoped<IUserService, UserService>();
            builder.Services.AddScoped<IGoogleAuthService, GoogleAuthService>();

            // JWT Authentication (конфигурация будет установлена динамически)
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    // Получаем сервис из провайдера
                    var serviceProvider = builder.Services.BuildServiceProvider();
                    var keyVaultService = serviceProvider.GetRequiredService<IKeyVaultService>();

                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer = true,
                        ValidateAudience = true,
                        ValidateLifetime = true,
                        ValidateIssuerSigningKey = true,
                        // Эти значения будут установлены динамически
                        ValidIssuer = null,
                        ValidAudience = null,
                        IssuerSigningKey = null
                    };

                    // Динамическая загрузка параметров при каждом запросе
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = async context =>
                        {
                            var keyVault = context.HttpContext.RequestServices.GetRequiredService<IKeyVaultService>();
                            
                            var secret = await keyVault.GetJwtSecretAsync();
                            var issuer = await keyVault.GetJwtIssuerAsync();
                            var audience = await keyVault.GetJwtAudienceAsync();

                            context.Options.TokenValidationParameters.ValidIssuer = issuer;
                            context.Options.TokenValidationParameters.ValidAudience = audience;
                            context.Options.TokenValidationParameters.IssuerSigningKey = 
                                new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
                        }
                    };
                });

            builder.Services.AddAuthorization();
            builder.Services.AddOpenApi();

            // CORS for React app
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("ReactApp", policy =>
                {
                    policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
            });

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.MapOpenApi();
            }

            app.UseMiddleware<ExceptionHandlingMiddleware>();
            app.UseHttpsRedirection();
            app.UseCors("ReactApp");
            app.UseAuthentication();
            app.UseAuthorization();
            app.MapControllers();

            // Initialize database
            using (var scope = app.Services.CreateScope())
            {
                var dbContext = scope.ServiceProvider.GetRequiredService<AppDbContext>();
                dbContext.Database.EnsureCreated();
            }

            app.Run();
        }
    }
}