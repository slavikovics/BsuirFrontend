namespace backend.DTOs;

public class ScheduleAnalysisResponse
{
    public string AgentName { get; set; } = "Анализ учебной нагрузки";
    public string WorkloadLevel { get; set; } = "medium"; // low, medium, high
    public int EstimatedHours { get; set; }
    public string Analysis { get; set; } = ""; // Markdown текст с анализом
    public List<string> Recommendations { get; set; } = new();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
    public SecondAgentAnalysis? SecondAgent { get; set; }
}

public class SecondAgentAnalysis
{
    public string AgentName { get; set; } = "Детальный анализ продуктивности";
    public string Analysis { get; set; } = "";
    public List<string> TimeManagementTips { get; set; } = new();
}