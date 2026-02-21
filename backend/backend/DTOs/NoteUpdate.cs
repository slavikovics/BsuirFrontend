namespace backend.DTOs;

public class NoteUpdate
{
    public string Title { get; set; }
    public string Content { get; set; }
    public Dictionary<string, object> Metadata { get; set; }
    public string AccessLevel { get; set; }
    public List<string> Tags { get; set; }
}