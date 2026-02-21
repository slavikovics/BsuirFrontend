using System.Text.Json;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using Task = backend.Models.Task;

namespace backend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users { get; set; } = null!;

    public DbSet<Task> Tasks { get; set; } = null!;

    public DbSet<ScheduleAnalysis> ScheduleAnalyses { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasIndex(u => u.GoogleId)
            .IsUnique();
                
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
        
        modelBuilder.Entity<ScheduleAnalysis>()
            .HasIndex(a => a.UserId)
            .IsUnique();
        
        modelBuilder.Entity<ScheduleAnalysis>()
            .Property(a => a.Recommendations)
            .HasConversion(
                v => JsonSerializer.Serialize(v, new JsonSerializerOptions()),
                v => JsonSerializer.Deserialize<List<string>>(v, new JsonSerializerOptions()) ?? new List<string>()
            );
    }
}