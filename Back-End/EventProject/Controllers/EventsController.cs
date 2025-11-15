using EventProject.Data;
using EventProject.Enum;
using EventProject.Models;
using EventProject.Request;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Data;
using System.Security.Claims;


namespace EventProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventsController : ControllerBase
    {
        private readonly DataContexcs _context;

        public EventsController(DataContexcs context)
        {
            _context = context;
        }

        [HttpGet("all")]
        public ActionResult GetAllEvents()
        {
            try
            {
                Console.WriteLine($"Total events: {_context.Events.Count()}");
                var events = _context.Events.Select(e => new {
                    e.Id,
                    e.Title,
                    e.Description,
                    e.StartDate,
                    e.EndDate,
                    e.LocationId,
                    e.OrganizerId,
                    e.Capacity,
                    Status = e.Status.ToString()
                }).ToList();

                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Error: " + ex.Message);
            }
        }

    

        [HttpGet("{id}")]
        public ActionResult GetEvent(int id)
        {
            try
            {
                Console.WriteLine($"Getting event with ID: {id}");

                var eventObj = _context.Events
                    .Where(e => e.Id == id)
                    .Select(e => new {
                        e.Id,
                        e.Title,
                        e.Description,
                        e.StartDate,
                        e.EndDate,
                        e.LocationId,
                        e.OrganizerId,
                        e.Capacity,
                        Status = e.Status.ToString()
                    })
                    .FirstOrDefault();

                if (eventObj == null)
                {
                    Console.WriteLine($"Event with ID {id} not found");
                    return NotFound($"Event with ID {id} not found");
                }

                Console.WriteLine($"Event found: {eventObj.Title}");
                return Ok(eventObj);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting event: {ex.Message}");
                return StatusCode(500, "Error: " + ex.Message);
            }
        }





        [HttpPost]
        public ActionResult CreateEvent([FromBody] CreateEventDTO model)
        {
            try
            {
                Console.WriteLine("=== CreateEvent Started ===");
                Console.WriteLine($"Model received: {model != null}");

                if (model != null)
                {
                    Console.WriteLine($"Title: {model.Title}");
                    Console.WriteLine($"LocationId: {model.LocationId}");
                    Console.WriteLine($"OrganizerId: {model.OrganizerId}");
                }

                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage);
                    Console.WriteLine($"ModelState errors: {string.Join(", ", errors)}");
                    return BadRequest($"Validation failed: {string.Join(", ", errors)}");
                }

                if (model == null)
                {
                    Console.WriteLine("Model is null");
                    return BadRequest("Invalid event data.");
                }

                if (model.StartDate >= model.EndDate)
                {
                    Console.WriteLine("Date validation failed");
                    return BadRequest("Event end date must be after start date.");
                }

                Console.WriteLine("Creating new event...");

               
                var newEvent = new Event
                {
                    Title = model.Title?.Trim() ?? "Default Title",
                    Description = !string.IsNullOrWhiteSpace(model.Description) ? model.Description.Trim() : "No description provided",
                    StartDate = model.StartDate,
                    EndDate = model.EndDate,
                    LocationId = model.LocationId,
                    OrganizerId = model.OrganizerId,
                    //Capacity = model.Capacity > 0 ? model.Capacity : 1,
                    Status = EventStatus.DRAFT
                };

                Console.WriteLine("Adding to context...");
                _context.Events.Add(newEvent);

                Console.WriteLine("Saving changes...");
                _context.SaveChanges();

                Console.WriteLine($"Event created with ID: {newEvent.Id}");

                return CreatedAtAction(nameof(GetEvent), new { id = newEvent.Id },
                    new { id = newEvent.Id, message = "Event created successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== ERROR ===");
                Console.WriteLine($"Error creating event: {ex}");
                Console.WriteLine($"Inner Exception: {ex.InnerException?.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");

                if (ex.InnerException != null)
                {
                    return StatusCode(500, $"Database error: {ex.InnerException.Message}");
                }

                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public ActionResult UpdateEvent(int id, [FromBody] UpdateEventDTO model)
        {
            try
            {
                Console.WriteLine($"Updating event with ID: {id}");

                if (model == null)
                {
                    Console.WriteLine("Model is null");
                    return BadRequest("Invalid event data");
                }

                var eventObj = _context.Events.FirstOrDefault(e => e.Id == id);
                if (eventObj == null)
                {
                    Console.WriteLine($"Event with ID {id} not found");
                    return NotFound("Event not found");
                }

                Console.WriteLine("Updating event properties...");

              
                if (!string.IsNullOrEmpty(model.Title))
                    eventObj.Title = model.Title.Trim();

                if (model.Description != null)
                    eventObj.Description = model.Description.Trim();

                eventObj.StartDate = model.StartDate;
                eventObj.EndDate = model.EndDate;
                eventObj.LocationId = model.LocationId;
                eventObj.Capacity = model.Capacity;

                _context.SaveChanges();
                Console.WriteLine($"Event {id} updated successfully");

                return Ok(new { message = "Event updated successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error updating event: {ex.Message}");
                return StatusCode(500, "Error: " + ex.Message);
            }
        }

        [HttpDelete("{id}")]
        public ActionResult DeleteEvent(int id)
        {
            try
            {
                Console.WriteLine($"Deleting event with ID: {id}");

                var eventObj = _context.Events.FirstOrDefault(e => e.Id == id);
                if (eventObj == null)
                {
                    Console.WriteLine($"Event with ID {id} not found");
                    return NotFound("Event not found");
                }

                Console.WriteLine($"Deleting event: {eventObj.Title}");

                _context.Events.Remove(eventObj);
                _context.SaveChanges();

                Console.WriteLine($"Event {id} deleted successfully");

                return Ok(new { message = "Event deleted successfully" });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error deleting event: {ex.Message}");
                return StatusCode(500, "Error: " + ex.Message);
            }
        }

        [HttpGet("locations")]
        public ActionResult<List<LocationDTO>> GetLocations()
        {
            try
            {
                var locations = _context.Locations.ToList();
                var locationDTOs = locations.Select(l => new LocationDTO
                {
                    Id = l.Id,
                    Name = l.Name,
                    Address = l.Address,
                    City = l.City,
                    Country = l.Country
                }).ToList();

                return Ok(locationDTOs);
            }
            catch (Exception ex)
            {
                return StatusCode(500, "Internal server error: " + ex.Message);
            }
        }
    }
}