using webservice.data;

var builder = WebApplication.CreateBuilder(args);

// ⭐ IMPORTANT: Configure to listen on all network interfaces
builder.WebHost.UseUrls("http://0.0.0.0:5116");

builder.Services.AddSingleton<DBConnect>();
builder.Services.AddScoped<webservice.services.StationService>();
builder.Services.AddScoped<webservice.services.BookingService>();
builder.Services.AddScoped<webservice.services.EVOwnerService>();

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
            // ⭐ IMPORTANT: Allow requests from any origin (including your Android app)
            builder.WithOrigins(
                "http://localhost:5173",        // Your web frontend
                "http://192.168.43.8:5173",     // Web frontend on network
                "http://192.168.43.1:5173"      // Potential mobile browser
            )
            .AllowAnyHeader()
            .AllowAnyMethod();
            
            // For development, you can also use AllowAnyOrigin (less secure)
            // builder.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod();
        });
});

var app = builder.Build();

app.UseCors("AllowSpecificOrigin");

app.MapGet("/", () => "EVCONNECT Backend Started!");
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Run();