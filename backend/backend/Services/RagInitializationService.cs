namespace backend.Services;

public class RagInitializationService : IRagInitializationService
{
    private readonly IKeyVaultService _keyVaultService;

    public RagInitializationService(IKeyVaultService keyVaultService)
    {
        _keyVaultService = keyVaultService;
    }

    public async Task InitializeRag()
    {
        var url = await _keyVaultService.GetBaseUrlAsync();
        using var httpClient = new HttpClient();
        httpClient.BaseAddress = new Uri(url);
        await httpClient.PostAsync("/db/init", null);
    }
}