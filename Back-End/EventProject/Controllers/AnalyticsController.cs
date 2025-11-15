using EventProject.Data;
using EventProject.Request;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace EventProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnalyticsController : ControllerBase
    {
        private readonly DataContexcs _context;

        public AnalyticsController(DataContexcs context)
        {
            _context = context;
        }

        // გაყიდვების სტატისტიკა
        [HttpGet("sales-summary")]
        public async Task<IActionResult> GetSalesSummary()
        {
            var summary = await _context.Purchases
                .GroupBy(p => p.Ticket.Event.Title)
                .Select(g => new
                {
                    EventTitle = g.Key,
                    TotalSales = g.Sum(p => p.Quantity * p.Ticket.Price),
                    TicketsSold = g.Sum(p => p.Quantity),
                    Revenue = g.Sum(p => p.Quantity * p.Ticket.Price)
                })
                .ToListAsync();

            return Ok(summary);
        }

        [HttpGet("daily-sales")]
        public async Task<IActionResult> GetDailySales([FromQuery] string startDate, [FromQuery] string endDate)
        {
            var start = DateTime.Today.AddDays(-30);
            var end = DateTime.Today;

            if (!string.IsNullOrEmpty(startDate) && DateTime.TryParse(startDate, out var parsedStart))
                start = parsedStart;

            if (!string.IsNullOrEmpty(endDate) && DateTime.TryParse(endDate, out var parsedEnd))
                end = parsedEnd.AddDays(1).AddSeconds(-1); 

            Console.WriteLine($"Searching from {start} to {end}");

            var dailySales = await _context.Purchases
                .Where(p => p.PurchaseDate >= start && p.PurchaseDate <= end)
                .GroupBy(p => p.PurchaseDate.Date)
                .Select(g => new
                {
                    Date = g.Key,
                    TotalSales = g.Sum(p => p.Quantity * p.TotalAmount), 
                    TicketCount = g.Sum(p => p.Quantity)
                })
                .OrderBy(x => x.Date)
                .ToListAsync();

            Console.WriteLine($"Found {dailySales.Count} records");
            return Ok(dailySales);
        }

        [HttpGet("event/{eventId}/sales")]
        public async Task<IActionResult> GetEventSales(int eventId)
        {
            var eventSales = await _context.Purchases
                .Where(p => p.Ticket.EventId == eventId)
                .GroupBy(p => p.Ticket.Type)
                .Select(g => new
                {
                    TicketType = g.Key,
                    Quantity = g.Sum(p => p.Quantity),
                    Revenue = g.Sum(p => p.Quantity * p.Ticket.Price),
                    AveragePrice = g.Average(p => p.Ticket.Price)
                })
                .ToListAsync();

            return Ok(eventSales);
        }

        [HttpGet("top-events")]
        public async Task<IActionResult> GetTopSellingEvents([FromQuery] int limit = 10)
        {
            var topEvents = await _context.Purchases
                .GroupBy(p => new { p.Ticket.EventId, p.Ticket.Event.Title })
                .Select(g => new
                {
                    EventId = g.Key.EventId,
                    EventTitle = g.Key.Title,
                    TotalRevenue = g.Sum(p => p.Quantity * p.Ticket.Price),
                    TicketsSold = g.Sum(p => p.Quantity)
                })
                .OrderByDescending(x => x.TotalRevenue)
                .Take(limit)
                .ToListAsync();

            return Ok(topEvents);
        }

        
        [HttpPost("mark-attendance")]
        public async Task<IActionResult> MarkAttendance([FromBody] MarkAttendanceRequest request)
        {
            var participant = await _context.Participants
                .FirstOrDefaultAsync(p => p.Id == request.ParticipantId);

            if (participant == null)
                return NotFound("მონაწილე ვერ მოიძებნა");

            participant.Attendance = request.IsPresent;
            await _context.SaveChangesAsync();

            return Ok(new { message = "დასწრება განახლდა" });
        }

        [HttpGet("event/{eventId}/attendance")]
        public async Task<IActionResult> GetEventAttendance(int eventId)
        {
            var attendance = await _context.Participants
                .Where(p => p.EventId == eventId)
                .Select(p => new
                {
                    p.Id,
                    UserName = p.User.FirstName + " " + p.User.LastName,
                    p.User.Email,
                    p.TicketId,
                    p.RegistrationDate,
                    p.Attendance
                })
                .ToListAsync();

            var stats = new
            {
                TotalRegistered = attendance.Count,
                TotalAttended = attendance.Count(a => a.Attendance),
                AttendanceRate = attendance.Count > 0 ?
                    (double)attendance.Count(a => a.Attendance) / attendance.Count * 100 : 0,
                Participants = attendance
            };

            return Ok(stats);
        }

        [HttpGet("attendance-stats")]
        public async Task<IActionResult> GetAttendanceStats()
        {
            var stats = await _context.Events
                .Select(e => new
                {
                    EventId = e.Id,
                    EventTitle = e.Title,
                    EventDate = e.StartDate,
                    TotalRegistered = e.Participants.Count,
                    TotalAttended = e.Participants.Count(p => p.Attendance),
                    AttendanceRate = e.Participants.Count > 0 ?
                        (double)e.Participants.Count(p => p.Attendance) / e.Participants.Count * 100 : 0
                })
                .ToListAsync();

            return Ok(stats);
        }

        
        [HttpGet("user-activity")]
        public async Task<IActionResult> GetUserActivity([FromQuery] int? userId)
        {
            var query = _context.Purchases.AsQueryable();

            if (userId.HasValue)
                query = query.Where(p => p.UserId == userId.Value);

            var activity = await query
                .GroupBy(p => new { p.UserId, p.User.FirstName, p.User.LastName })
                .Select(g => new
                {
                    UserId = g.Key.UserId,
                    UserName = g.Key.FirstName + " " + g.Key.LastName,
                    TotalPurchases = g.Count(),
                    TotalSpent = g.Sum(p => p.Quantity * p.Ticket.Price),
                    EventsAttended = g.Select(p => p.Ticket.EventId).Distinct().Count(),
                    AverageSpending = g.Average(p => p.Quantity * p.Ticket.Price),
                    LastPurchase = g.Max(p => p.PurchaseDate)
                })
                .OrderByDescending(x => x.TotalSpent)
                .ToListAsync();

            return Ok(activity);
        }

        [HttpGet("popular-event-types")]
        public async Task<IActionResult> GetPopularEventTypes()
        {
            var eventTypes = await _context.Purchases
                .GroupBy(p => p.Ticket.Event.Title)
                .Select(g => new
                {
                    EventType = g.Key,
                    PurchaseCount = g.Count(),
                    UniqueUsers = g.Select(p => p.UserId).Distinct().Count(),
                    TotalRevenue = g.Sum(p => p.Quantity * p.Ticket.Price)
                })
                .OrderByDescending(x => x.PurchaseCount)
                .ToListAsync();

            return Ok(eventTypes);
        }

        [HttpGet("purchase-patterns")]
        public async Task<IActionResult> GetPurchasePatterns()
        {
            var purchases = await _context.Purchases
                .Include(p => p.Ticket)
                .ToListAsync(); 

            var patterns = purchases
                .GroupBy(p => new
                {
                    Hour = p.PurchaseDate.Hour,
                    DayOfWeek = p.PurchaseDate.DayOfWeek
                })
                .Select(g => new
                {
                    Hour = g.Key.Hour,
                    DayOfWeek = g.Key.DayOfWeek.ToString(),
                    PurchaseCount = g.Count(),
                    Revenue = g.Sum(p => p.Quantity * p.Ticket.Price)
                })
                .OrderBy(x => x.DayOfWeek)
                .ThenBy(x => x.Hour)
                .ToList();

            return Ok(patterns);
        }

        [HttpGet("repeat-customers")]
        public async Task<IActionResult> GetRepeatCustomers()
        {
            var repeatCustomers = await _context.Purchases
                .GroupBy(p => new { p.UserId, p.User.FirstName, p.User.LastName, p.User.Email })
                .Where(g => g.Count() > 1)
                .Select(g => new
                {
                    UserId = g.Key.UserId,
                    UserName = g.Key.FirstName + " " + g.Key.LastName,
                    Email = g.Key.Email,
                    PurchaseCount = g.Count(),
                    TotalSpent = g.Sum(p => p.Quantity * p.Ticket.Price),
                    FirstPurchase = g.Min(p => p.PurchaseDate),
                    LastPurchase = g.Max(p => p.PurchaseDate)
                })
                .OrderByDescending(x => x.PurchaseCount)
                .ToListAsync();

            return Ok(repeatCustomers);
        }

        [HttpGet("monthly-trends")]
        public async Task<IActionResult> GetMonthlyTrends()
        {
            var trends = await _context.Purchases
                .GroupBy(p => new { p.PurchaseDate.Year, p.PurchaseDate.Month })
                .Select(g => new
                {
                    Year = g.Key.Year,
                    Month = g.Key.Month,
                    TotalSales = g.Sum(p => p.Quantity * p.Ticket.Price),
                    TicketsSold = g.Sum(p => p.Quantity),
                    UniqueCustomers = g.Select(p => p.UserId).Distinct().Count()
                })
                .OrderBy(x => x.Year)
                .ThenBy(x => x.Month)
                .ToListAsync();

            return Ok(trends);
        }
    }

}

