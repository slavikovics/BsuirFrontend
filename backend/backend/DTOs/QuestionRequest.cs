namespace backend.DTOs;

public class QuestionRequest
{
    public string Question { get; set; }
    public bool UseContext { get; set; } = true;
    public int K { get; set; } = 3;
}