using webservice.data;

var builder = WebApplication.CreateBuilder(args);

// Register MongoDB connection as singleton
builder.Services.AddSingleton<DBConnect>();
builder.Services.AddScoped<webservice.services.StationService>();
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(new System.Text.Json.Serialization.JsonStringEnumConverter());
    });
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        builder =>
        {
            builder.WithOrigins("http://localhost:5173")
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

// ✅ Add CORS policy for React frontend
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp",
        policy => policy
                        .WithOrigins("http://localhost:3000", "http://127.0.0.1:3000")
            .AllowAnyMethod()
            .AllowAnyHeader()
            .AllowCredentials());
});

var app = builder.Build();

app.UseCors("AllowSpecificOrigin");

app.UseCors("AllowSpecificOrigin");

// ✅ Use CORS before controllers
app.UseCors("AllowReactApp");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}
app.UseRouting(); // ✅ Add this
app.UseAuthorization(); // ✅ Add this

app.MapControllers();

app.MapGet("/", () => "EVCONNECT Backend Started!");

app.Run();
