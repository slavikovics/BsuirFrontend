using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class ScheduleAnalysisRepository : IScheduleAnalysisRepository
{
    private readonly AppDbContext _context;
    private readonly ILogger<ScheduleAnalysisRepository> _logger;

    public ScheduleAnalysisRepository(
        AppDbContext context,
        ILogger<ScheduleAnalysisRepository> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<ScheduleAnalysis?> GetByUserIdAsync(int userId)
    {
        return await _context.ScheduleAnalyses
            .Where(a => a.UserId == userId)
            .OrderByDescending(a => a.Timestamp)
            .FirstOrDefaultAsync();
    }

    public async Task<ScheduleAnalysis> CreateOrUpdateAsync(ScheduleAnalysis analysis)
    {
        var existing = await _context.ScheduleAnalyses
            .FirstOrDefaultAsync(a => a.UserId == analysis.UserId);

        if (existing != null)
        {
            existing.WorkloadLevel = analysis.WorkloadLevel;
            existing.EstimatedHours = analysis.EstimatedHours;
            existing.Analysis = analysis.Analysis;
            existing.Recommendations = analysis.Recommendations;
            existing.Timestamp = analysis.Timestamp;

            _context.ScheduleAnalyses.Update(existing);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Updated schedule analysis for user {UserId}", analysis.UserId);
            return existing;
        }
        else
        {
            _context.ScheduleAnalyses.Add(analysis);
            await _context.SaveChangesAsync();

            _logger.LogInformation("Created new schedule analysis for user {UserId}", analysis.UserId);
            return analysis;
        }
    }

    public async Task<bool> DeleteByUserIdAsync(int userId)
    {
        var analysis = await _context.ScheduleAnalyses
            .FirstOrDefaultAsync(a => a.UserId == userId);

        if (analysis == null)
            return false;

        _context.ScheduleAnalyses.Remove(analysis);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Deleted schedule analysis for user {UserId}", userId);
        return true;
    }
}