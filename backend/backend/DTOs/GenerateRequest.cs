using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class GenerateRequest
{
    public string Query { get; set; }
    public int MaxFiles { get; set; } = 10;
}