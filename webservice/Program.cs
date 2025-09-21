using webservice.data;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddSingleton<DBConnect>();

var app = builder.Build();

app.MapGet("/", () => "Hello World!");


app.Run();
