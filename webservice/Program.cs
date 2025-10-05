using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using webservice.data;
using webservice.Services;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddSingleton<JwtService>();

//builder.Services.AddSingleton<JwtService>();


// ✅ Add DB & Services
builder.Services.AddSingleton<DBConnect>();
//builder.Services.AddScoped<StationService>();

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
            policy.WithOrigins("http://localhost:5173")
                  .AllowAnyHeader()
                  .AllowAnyMethod();
        });
});

// ================= JWT SETUP =================
var jwtSettings = builder.Configuration.GetSection("Jwt");
var key = Encoding.ASCII.GetBytes(jwtSettings.GetValue<string>("Key"));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.GetValue<string>("Issuer"),
        ValidAudience = jwtSettings.GetValue<string>("Audience"),
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero // optional: remove default 5 min buffer
    };
});
// ============================================

var app = builder.Build();

// ✅ Enable Swagger in Development
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowSpecificOrigin");

// ✅ Add authentication & authorization middleware
app.UseAuthentication();
app.UseAuthorization();

app.MapGet("/", () => "EVCONNECT Backend Started!");
app.MapControllers();

app.Run();
