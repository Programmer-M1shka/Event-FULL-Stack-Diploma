using EventProject.Data;
using EventProject.Models;
using EventProject.Services;
using EventProject.Services.Abstraction;
using EventProject.Services.Implementation;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.Text;




var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyHeader()
                   .AllowAnyMethod();
        });
});

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddDbContext<DataContexcs>();
builder.Services.AddScoped<IUserService, UserService>();
builder.Services.AddScoped<IJWTService, JWTService>();
builder.Services.AddScoped<IPasswordHasher<User>, PasswordHasher<User>>();


builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = "chven",
            ValidAudience = "isini",
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("cc14dc33397c2b073b1ee85c270fd301a83b9494c472119bebe1bd37a187fad1c21edd872dc84b904079015bd29cc2b26972b97a19709aa31ad2c7fa161569fbae1b8ff71440251aeccd72106ba5118035201e8d6f6ba0dfa8647cac7b3f525cca0ef27f85789527cfe265b1936944dcf008e1dd616c526bf310e90a0ba1df7a5da4610193dc3ab34e9e10f2c7c2b510e299c27f7b517c05986908f5aeead9a8b48623b0ebb43ebaf1bb5db7029a5ef11f11ea7e148292714198428e629ef0b6fdec1d6085243ee42a608e854b9e90b3196506439d7962c3d5fd69309f20287a8cdb4eed2afbee1339d8a9d3a84d447fd1940c85bbe6ab7988f1f16c9aa967fe"))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();
// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();
