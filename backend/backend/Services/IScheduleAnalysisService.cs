using backend.DTOs;

namespace backend.Services;

public interface IScheduleAnalysisService
{
    Task<ScheduleAnalysisResponse> AnalyzeAndSaveUserScheduleAsync(int userId);
    Task<ScheduleAnalysisResponse?> GetLastAnalysisByUserIdAsync(int userId);
    Task<ScheduleAnalysisResponse> RegenerateAnalysisAsync(int userId);
    Task<bool> DeleteAnalysisByUserIdAsync(int userId);
    Task<ScheduleAnalysisResponse> AnalyzeUserScheduleAsync(int userId);
}