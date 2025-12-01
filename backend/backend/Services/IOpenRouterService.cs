namespace backend.Services;

public interface IOpenRouterService
{
    Task<string> GetAnalysisAsync(string prompt);
}