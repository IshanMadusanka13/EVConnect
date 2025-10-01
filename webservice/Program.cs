using webservice.data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<DBConnect>();
builder.Services.AddScoped<webservice.services.StationService>();

builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.Converters.Add(
            new System.Text.Json.Serialization.JsonStringEnumConverter()
        );
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowSpecificOrigin",
        policy =>
        {
            policy.WithOrigins("http://localhost:5173") // React app
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

var app = builder.Build();

// ✅ Enable Swagger in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

// ✅ Make sure the middleware order is correct
app.UseHttpsRedirection();

app.UseCors("AllowSpecificOrigin"); // CORS must be before MapControllers

app.UseAuthorization();

app.MapGet("/", () => "EVCONNECT Backend Started!");
app.MapControllers();

app.Run();
