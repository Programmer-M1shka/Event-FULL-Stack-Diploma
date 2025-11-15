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
    public class TicketsController : ControllerBase
    {
        private readonly DataContexcs _context;

        public TicketsController(DataContexcs context)
        {
            _context = context;
        }







        [HttpGet("{id}")]
        public ActionResult GetTicket(int id)
        {
            var ticket = _context.Tickets
                .Include(t => t.Event)
                .FirstOrDefault(t => t.Id == id);

            if (ticket == null)
                return NotFound("Ticket not found");

            var ticketDTO = new TicketDTO
            {
                Id = ticket.Id,
                EventId = ticket.EventId,
                Type = ticket.Type,
                Price = ticket.Price,
                Quantity = ticket.Quantity,
                Status = ticket.Status.ToString()
            };

            return Ok(ticketDTO);
        }






        [HttpPost]
        public ActionResult CreateTicket([FromBody] CreateTicketDTO model)
        {
            try
            {
                Console.WriteLine("=== CreateTicket Started ===");

                if (model == null)
                {
                    Console.WriteLine("Model is null");
                    return BadRequest("Invalid ticket data.");
                }

                if (!ModelState.IsValid)
                {
                    var errors = ModelState.Values
                        .SelectMany(v => v.Errors)
                        .Select(e => e.ErrorMessage);
                    Console.WriteLine($"Validation errors: {string.Join(", ", errors)}");
                    return BadRequest($"Validation failed: {string.Join(", ", errors)}");
                }

                var eventObj = _context.Events.FirstOrDefault(e => e.Id == model.EventId);
                if (eventObj == null)
                {
                    Console.WriteLine($"Event with ID {model.EventId} not found");
                    return BadRequest("Invalid event.");
                }

                // ამოვიღეთ OrganizerId-ზე დამოკიდებული ავტორიზაციის შემოწმება

                var newTicket = new Ticket
                {
                    EventId = eventObj.Id,
                    Event = eventObj,
                    Type = model.Type?.Trim(),
                    Price = model.Price,
                    Quantity = model.Quantity,
                    TotalAmount = model.Price * model.Quantity,
                    Status = model.Quantity > 0 ? TicketStatus.AVAILABLE : TicketStatus.SOLD_OUT
                };

                _context.Tickets.Add(newTicket);
                _context.SaveChanges();

                Console.WriteLine($"Ticket created with ID: {newTicket.Id}");

                return CreatedAtAction(nameof(GetTicket), new { id = newTicket.Id }, new
                {
                    id = newTicket.Id,
                    message = "Ticket created successfully"
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine("=== ERROR ===");
                Console.WriteLine($"Exception: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }



        [HttpPost("purchase")]
        public ActionResult PurchaseTicket([FromBody] CreatePurchaseDTO model)
        {
            if (model == null)
                return BadRequest("Invalid purchase data");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // 1. ვპოულობთ ივენთს
            var evt = _context.Events.FirstOrDefault(e => e.Id == model.EventId);
            if (evt == null)
                return NotFound("Event not found");

            // 2. ვპოულობთ ტიკეტს ამ ივენთზე და ამ ტიპით
            var ticket = _context.Tickets
                .FirstOrDefault(t => t.EventId == model.EventId && t.Type.ToLower() == model.TicketType.ToLower());

            if (ticket == null)
                return NotFound("Ticket type not found for this event");

            // 3. პრომოკოდი
            var promoDiscounts = new Dictionary<string, decimal>
    {
        { "10%", 0.10m },
        { "20%", 0.20m },
        { "60%", 0.60m }
    };

            decimal discount = 0;
            if (!string.IsNullOrEmpty(model.PromoCode))
            {
                var code = model.PromoCode.Trim().ToUpper();
                if (promoDiscounts.ContainsKey(code))
                    discount = promoDiscounts[code];
                else
                    return BadRequest("Invalid promo code");
            }

            // 4. ვამოწმებთ რაოდენობას
            if (ticket.Status == TicketStatus.SOLD_OUT || ticket.Quantity < model.Quantity)
                return BadRequest("Not enough tickets available");

            // 5. მომხმარებელი
            var user = _context.Users.Find(model.UserId);
            if (user == null)
                return NotFound("User not found");

            // 6. ფასდაკლება
            var totalPrice = ticket.Price * model.Quantity;
            var discountedPrice = totalPrice * (1 - discount);

            // 7. ვქმნით ყიდვას
            var purchase = new Purchase
            {
                TicketId = ticket.Id,
                UserId = model.UserId,
                Quantity = model.Quantity,
                TotalAmount = discountedPrice,
                PurchaseDate = DateTime.UtcNow,
                Status = PurchaseStatus.COMPLETED
            };

            _context.Purchases.Add(purchase);

            ticket.Quantity -= model.Quantity;
            if (ticket.Quantity <= 0)
                ticket.Status = TicketStatus.SOLD_OUT;

            // 8. ვამატებთ მონაწილეს
            var participantExists = _context.Participants
                .Any(p => p.EventId == evt.Id && p.UserId == model.UserId);

            if (!participantExists)
            {
                _context.Participants.Add(new Participant
                {
                    EventId = evt.Id,
                    UserId = model.UserId,
                    TicketId = ticket.Id,
                    RegistrationDate = DateTime.UtcNow,
                    Attendance = false
                });
            }

            _context.SaveChanges();

            return Ok(new
            {
                PurchaseId = purchase.Id,
                EventTitle = evt.Title,
                TicketType = ticket.Type,
                Quantity = purchase.Quantity,
                OriginalAmount = totalPrice,
                DiscountPercentage = discount * 100,
                TotalAmount = discountedPrice
            });
        }


        [HttpGet("event/{eventId}")]
        public ActionResult<IEnumerable<Ticket>> GetTicketsByEvent(int eventId)
        {
            try
            {
                var eventObj = _context.Events.FirstOrDefault(e => e.Id == eventId);
                if (eventObj == null)
                {
                    return NotFound("Event not found");
                }

                var tickets = _context.Tickets
                    .Where(t => t.EventId == eventId)
                    .Select(t => new
                    {
                        Id = t.Id,
                        EventId = t.EventId,
                        Type = t.Type,
                        Price = t.Price,
                        Quantity = t.Quantity,
                        Status = t.Status.ToString()
                    })
                    .ToList();

                return Ok(tickets);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error getting tickets for event {eventId}: {ex.Message}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("validate")]
        
        public ActionResult ValidateTicket([FromBody] int purchaseId)
        {
            var purchase = _context.Purchases
                .Include(p => p.Ticket)
                .Include(p => p.Ticket.Event)
                .Include(p => p.User)
                .FirstOrDefault(p => p.Id == purchaseId);

            if (purchase == null)
                return NotFound("Purchase record not found");

            var eventObj = purchase.Ticket.Event;

            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier).Value);
            var userRole = User.FindFirst(System.Security.Claims.ClaimTypes.Role).Value;

            if (userRole != "ADMIN" && eventObj.Organizer.Id != userId)
                return Forbid("You are not authorized to validate tickets for this event");

            var participant = _context.Participants
                .FirstOrDefault(p => p.EventId == eventObj.Id && p.UserId == purchase.UserId);

            if (participant != null)
            {
                participant.Attendance = true;
                _context.SaveChanges();
            }

            return Ok(new
            {
                Valid = true,
                Event = new
                {
                    Id = eventObj.Id,
                    Title = eventObj.Title
                },
                Ticket = new
                {
                    Type = purchase.Ticket.Type,
                    Quantity = purchase.Quantity
                },
                User = new
                {
                    Name = $"{purchase.User.FirstName} {purchase.User.LastName}",
                    Email = purchase.User.Email
                }
            });
        }
    }
}

