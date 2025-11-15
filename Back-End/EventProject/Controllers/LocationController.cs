using EventProject.Data;
using EventProject.Models;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using EventProject.Request;

namespace EventProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocationController : ControllerBase
    {
        private readonly DataContexcs _context;

        public LocationController(DataContexcs context)
        {
            _context = context;
        }

        [HttpPost("create-location")]
        public ActionResult CreateLocation([FromBody] LocationCreateDTO model)
        {
            try
            {
                var location = new Location
                {
                    // ID არ ვუყენებთ - Entity Framework ავტომატურად დააგენერირებს
                    Name = model.Name,
                    Address = model.Address,
                    City = model.City,
                    Country = model.Country,
                    ZipCode = model.ZipCode
                };

                _context.Locations.Add(location);
                _context.SaveChanges();

                return Ok(new
                {
                    message = "Location created successfully",
                    id = location.Id // ახლა უკვე დაგენერირებული ID-ს დაბრუნება
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error: " + ex.Message);
            }
        }


    }
}
