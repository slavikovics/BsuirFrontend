using backend.DTOs;
using backend.Models;
using Microsoft.EntityFrameworkCore;
using System.Text;
using System.Text.Json;
using System.Text.RegularExpressions;
using backend.Data;

namespace backend.Services;

public class ScheduleAnalysisService : IScheduleAnalysisService
{
    private readonly AppDbContext _context;
    private readonly IOpenRouterService _openRouterService;
    private readonly ILogger<ScheduleAnalysisService> _logger;
    private readonly ITaskService _taskService;

    public ScheduleAnalysisService(
        AppDbContext context,
        IOpenRouterService openRouterService,
        ILogger<ScheduleAnalysisService> logger,
        ITaskService taskService)
    {
        _context = context;
        _openRouterService = openRouterService;
        _logger = logger;
        _taskService = taskService;
    }

    public async Task<ScheduleAnalysisResponse> AnalyzeUserScheduleAsync(int userId)
    {
        var tasks = await _taskService.GetUserTasksAsync(userId);

        var analysisData = new
        {
            CurrentDate = DateTime.UtcNow,
            PendingTasks = tasks.Select(t => new
            {
                Title = t.Title,
                Description = t.Description,
                Priority = t.Priority,
                CreatedAt = t.CreatedAt,
                LessonName = t.LessonName,
                LessonTime = t.LessonTime
            }).ToList(),
            TaskStatistics = new
            {
                TotalTasks = tasks.Count,
                HighPriorityTasks = tasks.Count(t => t.Priority == "high"),
                MediumPriorityTasks = tasks.Count(t => t.Priority == "medium"),
                LowPriorityTasks = tasks.Count(t => t.Priority == "low"),
            }
        };

        var prompt = GenerateAnalysisPrompt(analysisData);
        var llmResponse = await _openRouterService.GetAnalysisAsync(prompt);

        return ParseLlmResponse(llmResponse);
    }

    private string GenerateAnalysisPrompt(object analysisData)
    {
        var jsonData = JsonSerializer.Serialize(analysisData, new JsonSerializerOptions
        {
            WriteIndented = true
        });

        return """
               Ты - AI ассистент для анализа учебной нагрузки студентов. Проанализируй данные студента и предоставь оценку нагрузки и рекомендации.

               Данные студента:
               """ + jsonData +
               """
               Проанализируй:
               1. Общий уровень нагрузки (низкий, средний, высокий)
               2. Ориентировочное количество часов в неделю для выполнения всех задач
               3. Подробный анализ в формате Markdown с обоснованием
               4. 3-5 практических рекомендаций по управлению временем

               Ответ предоставь в формате JSON:
               {{
                   "workload_level": "low|medium|high",
                   "estimated_hours": число,
                   "analysis": "## Анализ нагрузки\\n\\nТвой подробный анализ здесь...",
                   "recommendations": ["рекомендация 1", "рекомендация 2", ...]
               }}

               Будь конкретен в оценках и давай практические советы.
               """;
    }

    private ScheduleAnalysisResponse ParseLlmResponse(string llmResponse)
    {
        try
        {
            _logger.LogInformation("Parsing LLM response: {Response}", llmResponse);

            // Пытаемся распарсить как полный ответ OpenRouter
            var jsonDocument = JsonDocument.Parse(llmResponse);
            var root = jsonDocument.RootElement;

            string content;

            // Проверяем структуру ответа OpenRouter
            if (root.TryGetProperty("choices", out var choices) &&
                choices.GetArrayLength() > 0)
            {
                var firstChoice = choices[0];
                if (firstChoice.TryGetProperty("message", out var message) &&
                    message.TryGetProperty("content", out var contentElement))
                {
                    content = contentElement.GetString() ?? "";
                }
                else
                {
                    throw new Exception("Invalid OpenRouter response structure");
                }
            }
            else
            {
                // Если это не структура OpenRouter, используем ответ как есть
                content = llmResponse;
            }


            // Извлекаем JSON из content (может быть обернут в ```json ... ```)
            var jsonContent = ExtractJsonFromContent(content);
            _logger.LogInformation("Parsing analysis response: {Content}", jsonContent);

            // Парсим извлеченный JSON
            var analysisJson = JsonDocument.Parse(jsonContent);
            var analysisRoot = analysisJson.RootElement;

            var response = new ScheduleAnalysisResponse
            {
                WorkloadLevel = analysisRoot.GetProperty("workload_level").GetString() ?? "medium",
                EstimatedHours = analysisRoot.GetProperty("estimated_hours").GetDouble(),
                Analysis = analysisRoot.GetProperty("analysis").GetString() ?? "",
                Recommendations = analysisRoot.GetProperty("recommendations")
                    .EnumerateArray()
                    .Select(x => x.GetString() ?? "")
                    .Where(x => !string.IsNullOrEmpty(x))
                    .ToList(),
                Timestamp = DateTime.UtcNow
            };

            _logger.LogInformation("Successfully parsed LLM response: Workload={Workload}, Hours={Hours}",
                response.WorkloadLevel, response.EstimatedHours);

            return response;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse LLM response, using fallback.");

            return new ScheduleAnalysisResponse
            {
                WorkloadLevel = "medium",
                EstimatedHours = 20,
                Analysis =
                    "## Анализ нагрузки\n\nНе удалось получить детальный анализ. Рекомендуется обратиться к учебному плану и распределить задачи равномерно.",
                Recommendations = new List<string>
                {
                    "Приоритезируйте задачи по срокам выполнения",
                    "Разбейте большие задачи на подзадачи",
                    "Выделите время для регулярного повторения материала",
                    "Используйте календарь для планирования учебного времени",
                    "Делайте регулярные перерывы для поддержания продуктивности"
                },
                Timestamp = DateTime.UtcNow
            };
        }
    }

    private string ExtractJsonFromContent(string content)
    {
        try
        {
            // Просто ищем начало и конец JSON
            int startIndex = content.IndexOf('{');
            int endIndex = content.LastIndexOf('}');
        
            if (startIndex >= 0 && endIndex > startIndex)
            {
                string extracted = content.Substring(startIndex, endIndex - startIndex + 1);
                _logger.LogInformation("Extracted JSON: {Extracted}", extracted);
                return extracted;
            }
        
            return content;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error extracting JSON");
            return content;
        }
    }
}