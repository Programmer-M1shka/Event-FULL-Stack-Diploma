using EventProject.Data;
using EventProject.Enum;
using EventProject.Models;
using EventProject.Request;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EventProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ParticipantsController : ControllerBase
    {
        private readonly DataContexcs _context;

        public ParticipantsController(DataContexcs context)
        {
            _context = context;
        }




        [HttpGet("{id}")]
        public ActionResult GetParticipant(int id)
        {
            try
            {
                var participant = _context.Participants
                    .Include(p => p.Event)
                    .Include(p => p.User)
                    .Include(p => p.Ticket)
                    .FirstOrDefault(p => p.Id == id);

                if (participant == null)
                    return NotFound("Participant not found");

                var participantDTO = new ParticipantDTO
                {
                    Id = participant.Id,
                    EventId = participant.EventId,
                    EventTitle = participant.Event.Title,
                    User = new UserDTO
                    {
                        Id = participant.User.Id,
                        Username = participant.User.Username,
                        Email = participant.User.Email,
                        FirstName = participant.User.FirstName,
                        LastName = participant.User.LastName,
                        Role = participant.User.Role.ToString()
                    },
                   
                    TicketType = participant.Ticket?.Type,
                    RegistrationDate = participant.RegistrationDate,
                    Attendance = participant.Attendance
                };

                return Ok(participantDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("all")]
        public ActionResult<IEnumerable<ParticipantDTO>> GetAllParticipants()
        {
            var participants = _context.Participants
                .Include(p => p.Event)
                .Include(p => p.User)
                .Include(p => p.Ticket)
                .ToList();

            var participantDTOs = participants.Select(p => new ParticipantDTO
            {
                Id = p.Id,
                EventId = p.EventId,
                EventTitle = p.Event.Title,
                User = new UserDTO
                {
                    Id = p.User.Id,
                    Username = p.User.Username,
                    Email = p.User.Email,
                    FirstName = p.User.FirstName,
                    LastName = p.User.LastName,
                    Role = p.User.Role.ToString()
                },
               
                TicketType = p.Ticket?.Type,
                RegistrationDate = p.RegistrationDate,
                Attendance = p.Attendance
            }).ToList();

            return Ok(participantDTOs);
        }





        [HttpPost("register")]
        public ActionResult RegisterParticipant([FromBody] RegisterParticipantDTO model)
        {
            try
            {
                Console.WriteLine("=== RegisterParticipant Started ===");

                if (model == null)
                {
                    Console.WriteLine("ERROR: Model is null");
                    return BadRequest("Invalid registration data");
                }

                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage);
                    Console.WriteLine($"ERROR: Validation failed - {string.Join(", ", errors)}");
                    return BadRequest($"Validation failed: {string.Join(", ", errors)}");
                }

                Console.WriteLine($"Input data - EventId: {model.EventId}, UserId: {model.UserId}");

                var eventObj = _context.Events.FirstOrDefault(e => e.Id == model.EventId);
                if (eventObj == null)
                {
                    Console.WriteLine($"ERROR: Event {model.EventId} not found");
                    return BadRequest($"Event with ID {model.EventId} not found");
                }

                Console.WriteLine($"SUCCESS: Found Event - ID: {eventObj.Id}, Title: {eventObj.Title}, Capacity: {eventObj.Capacity}");

                var user = _context.Users.FirstOrDefault(u => u.Id == model.UserId);
                if (user == null)
                {
                    Console.WriteLine($"ERROR: User {model.UserId} not found");
                    return BadRequest($"User with ID {model.UserId} not found");
                }

                Console.WriteLine($"SUCCESS: Found User - ID: {user.Id}, Username: {user.Username}");

                var existingRegistration = _context.Participants
                    .FirstOrDefault(p => p.EventId == model.EventId && p.UserId == model.UserId);
                if (existingRegistration != null)
                {
                    Console.WriteLine($"ERROR: User {model.UserId} already registered for event {model.EventId}");
                    return BadRequest("User is already registered for this event");
                }

                var currentParticipants = _context.Participants.Count(p => p.EventId == model.EventId);
                if (eventObj.Capacity > 0 && currentParticipants >= eventObj.Capacity)
                {
                    Console.WriteLine("ERROR: Event capacity reached");
                    return BadRequest("The event has reached its capacity");
                }

                // TicketId ამოღებულია!
                var participant = new Participant
                {
                    EventId = model.EventId,
                    UserId = model.UserId,
                    RegistrationDate = DateTime.UtcNow,
                    Attendance = false
                };

                _context.Participants.Add(participant);
                _context.SaveChanges();

                Console.WriteLine($"SUCCESS: Participant created with ID: {participant.Id}");

                var responseParticipant = _context.Participants
                    .Include(p => p.Event)
                    .Include(p => p.User)
                    .FirstOrDefault(p => p.Id == participant.Id);

                var participantDTO = new ParticipantDTO
                {
                    Id = responseParticipant.Id,
                    EventId = responseParticipant.EventId,
                    EventTitle = responseParticipant.Event.Title,
                    User = new UserDTO
                    {
                        Id = responseParticipant.User.Id,
                        Username = responseParticipant.User.Username,
                        Email = responseParticipant.User.Email,
                        FirstName = responseParticipant.User.FirstName,
                        LastName = responseParticipant.User.LastName,
                        Role = responseParticipant.User.Role.ToString()
                    },
                    RegistrationDate = responseParticipant.RegistrationDate,
                    Attendance = responseParticipant.Attendance
                };

                Console.WriteLine("=== Registration completed successfully ===");
                return CreatedAtAction(nameof(GetParticipant), new { id = participant.Id }, participantDTO);
            }
            catch (Exception ex)
            {
                Console.WriteLine("=== CRITICAL ERROR ===");
                Console.WriteLine($"Exception: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }


        // PUT: api/Participants/{id}/attendance
        [HttpPut("{id}/attendance")]
        public ActionResult ToggleAttendance(int id, [FromBody] AttendanceUpdateDTO model)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var participant = _context.Participants
                    .Include(p => p.User)
                    .Include(p => p.Event)
                    .Include(p => p.Ticket)
                    .FirstOrDefault(p => p.Id == id);

                if (participant == null)
                {
                    return NotFound($"Participant with ID {id} not found");
                }

                participant.Attendance = model.Attendance;

                _context.Participants.Update(participant);
                _context.SaveChanges();

                var participantDTO = new ParticipantDTO
                {
                    Id = participant.Id,
                    EventId = participant.EventId,
                    EventTitle = participant.Event.Title,
                    User = new UserDTO
                    {
                        Id = participant.User.Id,
                        Username = participant.User.Username,
                        Email = participant.User.Email,
                        FirstName = participant.User.FirstName,
                        LastName = participant.User.LastName,
                        Role = participant.User.Role.ToString()
                    },
                    
                    TicketType = participant.Ticket?.Type,
                    RegistrationDate = participant.RegistrationDate,
                    Attendance = participant.Attendance
                };

                return Ok(participantDTO);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}

