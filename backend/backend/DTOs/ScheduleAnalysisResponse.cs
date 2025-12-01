namespace backend.DTOs;

public class ScheduleAnalysisResponse
{
    public string WorkloadLevel { get; set; } = "medium";
    public double EstimatedHours { get; set; }
    public string Analysis { get; set; } = "";
    public List<string> Recommendations { get; set; } = new();
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}