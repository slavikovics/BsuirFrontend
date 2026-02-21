namespace backend.DTOs;

public class NoteCreate
{
    public string Title { get; set; }
    public string Content { get; set; }
    public Dictionary<string, object> Metadata { get; set; }
    public string AccessLevel { get; set; } = "private";
    public List<string> Tags { get; set; }
}