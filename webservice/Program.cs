using webservice.data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<DBConnect>();
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.MapGet("/", () => "EVCONNECT Backend Started!");
app.MapControllers();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Run();