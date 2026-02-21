using System.ComponentModel.DataAnnotations;

namespace backend.DTOs;

public class FileUploadRequest
{
    public IFormFile File { get; set; }
    public string UserId { get; set; }
    public string Metadata { get; set; } = "{}";
}