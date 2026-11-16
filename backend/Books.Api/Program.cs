using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<BookDbContext>(options =>
{
    if (builder.Environment.IsEnvironment("Testing") || string.IsNullOrWhiteSpace(connectionString))
        options.UseInMemoryDatabase("BooksDb");
    else
        options.UseSqlServer(connectionString);
});

builder.Services.AddCors(options =>
    options.AddDefaultPolicy(policy =>
        policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

var app = builder.Build();
app.UseCors();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<BookDbContext>();
    db.Database.EnsureCreated();
}

app.MapGet("/health", () => Results.Ok(new { status = "healthy" }));

app.MapGet("/api/books", async (BookDbContext db) =>
    await db.Books.OrderByDescending(b => b.FechaRegistro).ToListAsync());

app.MapGet("/api/books/{id:int}", async (int id, BookDbContext db) =>
    await db.Books.FindAsync(id) is Book book ? Results.Ok(book) : Results.NotFound());

app.MapPost("/api/books", async (BookInput input, BookDbContext db) =>
{
    var now = DateTime.UtcNow;
    var book = new Book
    {
        Isbn = input.Isbn,
        Titulo = input.Titulo,
        Autor = input.Autor,
        AnioPublicacion = input.AnioPublicacion,
        Descripcion = input.Descripcion,
        FechaRegistro = now,
        FechaActualizacion = now
    };
    db.Books.Add(book);
    await db.SaveChangesAsync();
    return Results.Created($"/api/books/{book.Id}", book);
});

app.MapPut("/api/books/{id:int}", async (int id, BookInput input, BookDbContext db) =>
{
    var book = await db.Books.FindAsync(id);
    if (book is null) return Results.NotFound();

    book.Isbn = input.Isbn;
    book.Titulo = input.Titulo;
    book.Autor = input.Autor;
    book.AnioPublicacion = input.AnioPublicacion;
    book.Descripcion = input.Descripcion;
    book.FechaActualizacion = DateTime.UtcNow;

    await db.SaveChangesAsync();
    return Results.Ok(book);
});

app.MapDelete("/api/books/{id:int}", async (int id, BookDbContext db) =>
{
    var book = await db.Books.FindAsync(id);
    if (book is null) return Results.NotFound();

    db.Books.Remove(book);
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.Run();

public class Book
{
    public int Id { get; set; }
    public required string Isbn { get; set; }
    public required string Titulo { get; set; }
    public required string Autor { get; set; }
    public int AnioPublicacion { get; set; }
    public DateTime FechaRegistro { get; set; }
    public DateTime FechaActualizacion { get; set; }
    public string Descripcion { get; set; } = string.Empty;
}

public record BookInput(string Isbn, string Titulo, string Autor, int AnioPublicacion, string Descripcion);

public class BookDbContext(DbContextOptions<BookDbContext> options) : DbContext(options)
{
    public DbSet<Book> Books => Set<Book>();
}

public partial class Program { }
