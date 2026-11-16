using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Books.Tests;

public class BooksApiTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public BooksApiTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.WithWebHostBuilder(builder =>
        {
            builder.UseEnvironment("Testing");
        }).CreateClient();
    }

    [Fact]
    public async Task HealthEndpoint_ReturnsOk()
    {
        var response = await _client.GetAsync("/health");
        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateAndGetBook_WorksCorrectly()
    {
        var newBook = new BookInput(
            Isbn: "978-0132350884",
            Titulo: "Clean Architecture",
            Autor: "Robert C. Martin",
            AnioPublicacion: 2017,
            Descripcion: "A Craftsman's Guide to Software Structure and Design"
        );

        var postResponse = await _client.PostAsJsonAsync("/api/books", newBook);
        Assert.Equal(HttpStatusCode.Created, postResponse.StatusCode);

        var createdBook = await postResponse.Content.ReadFromJsonAsync<Book>();
        Assert.NotNull(createdBook);
        Assert.True(createdBook.Id > 0);
        Assert.Equal("Clean Architecture", createdBook.Titulo);
        Assert.NotEqual(default, createdBook.FechaRegistro);
        Assert.NotEqual(default, createdBook.FechaActualizacion);

        var getResponse = await _client.GetFromJsonAsync<List<Book>>("/api/books");
        Assert.NotNull(getResponse);
        Assert.Contains(getResponse, b => b.Isbn == "978-0132350884");
    }
}
