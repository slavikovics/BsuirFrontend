using backend.Models;

namespace backend.Services;

public interface IScheduleAnalysisRepository
{
    Task<ScheduleAnalysis?> GetByUserIdAsync(int userId);
    Task<ScheduleAnalysis> CreateOrUpdateAsync(ScheduleAnalysis analysis);
    Task<bool> DeleteByUserIdAsync(int userId);
}