using backend.DTOs;

namespace backend.Services;

public interface IScheduleAnalysisService
{
    Task<ScheduleAnalysisResponse> AnalyzeUserScheduleAsync(int userId);
}