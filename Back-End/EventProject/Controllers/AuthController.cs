using EventProject.Data;
using EventProject.Enum;
using EventProject.Models;
using EventProject.Request;
using EventProject.Services.Abstraction;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.Security.Claims;

namespace EventProject.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly IJWTService _jwtService;
        

        public AuthController(IUserService userService, IJWTService jwtService)
        {
            _userService = userService;
            _jwtService = jwtService;
          
        }


        

        [HttpGet("get-all-admins")]
      
        public ActionResult GetAllAdmins()
        {
            var admins = _userService.GetAdmins();
            return Ok(admins);
        }

        [HttpPost("assign-admin")]
        
        public IActionResult AssignAdminRole([FromBody] AssignAdminDTO request)
        {
            var success = _userService.AssignAdminRole(request.Email);
            if (!success)
            {
                return BadRequest(new { Message = "User not found or already an admin" });
            }
            return Ok(new { Message = "Admin role assigned successfully" });
        }

        [HttpPost("remove-admin")]
        public IActionResult RemoveAdminRole([FromBody] AssignAdminDTO request)
        {
            
            var targetEmail = request.Email;

           
            var currentUserEmail = User.FindFirstValue(ClaimTypes.Email);
            if (currentUserEmail == null)
                return Unauthorized(new { Message = "Unable to identify current user" });

           
            if (string.Equals(currentUserEmail, targetEmail, StringComparison.OrdinalIgnoreCase))
                return BadRequest(new { Message = "You cannot remove your own admin role" });

           
            var success = _userService.RemoveAdminRole(targetEmail);
            if (!success)
                return BadRequest(new { Message = "User not found or not an admin" });

            return Ok(new { Message = "Admin role removed successfully" });
        }







        [HttpPost("resend-code")]
        public IActionResult ResendVerificationCode([FromBody] EmailDTO request)
        {
            var success = _userService.ResendVerificationCode(request.Email);

            if (!success)
            {
                return BadRequest(new { Message = "User not found or already verified" });
            }

            return Ok(new { Message = "Verification code resent" });
        }



        [HttpPost("register")]
        public ActionResult Register([FromBody] UserDTO req)
        {
            var response = _userService.AddUser(req);

            if (response == null)
            {
                return BadRequest(new { Message = "Something went wrong" });
            }

            return Ok(response);
        }




        [HttpGet("get-all-users")]
        public ActionResult GetAllUsers()
        {
            var Users = _userService.GetUsers();
            return Ok(Users);
        }





        [HttpPost("verify-email")]
        public ActionResult Verify([FromBody] VerifyDTO req)
        {
            bool isVerified = _userService.VerifyUser(req.Email, req.Code);

            if (!isVerified)
            {
                return BadRequest(new { Message = "Invalid code or email" });
            }

            return Ok(new { Message = "Verified" });
        }




        [HttpGet("get-profile")]
        [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
        public ActionResult GetProfile([FromQuery] int id)
        {
            var profile = _userService.GetProfile(id);
            return Ok(profile);
        }




        [HttpPost("login")]
        public ActionResult LogIn([FromBody] LoginDTO req)
        {
            var user = _userService.Login(req.Email, req.Password);

            if (user == null)
            {
                return BadRequest(new { Message = "Invalid credentials" });
            }

            var token = _jwtService.GenerateToken(user);
            return Ok(new { Token = token });
        }

        [HttpPost("forgot-password")]
        public IActionResult ForgotPassword([FromBody] EmailDTO request)
        {
            var success = _userService.RequestPasswordReset(request.Email);
            if (!success)
            {
                return BadRequest(new { Message = "User not found or not verified" });
            }
            return Ok(new { Message = "Password reset code sent to your email" });
        }

        [HttpPost("verify-reset-code")]
        public IActionResult VerifyResetCode([FromBody] VerifyDTO request)
        {
            var isValid = _userService.VerifyPasswordResetCode(request.Email, request.Code);
            if (!isValid)
            {
                return BadRequest(new { Message = "Invalid or expired reset code" });
            }
            return Ok(new { Message = "Reset code verified successfully" });
        }

        [HttpPost("reset-password")]
        public IActionResult ResetPassword([FromBody] ResetPasswordDTO request)
        {
            var success = _userService.ResetPassword(request.Email, request.Code, request.NewPassword);
            if (!success)
            {
                return BadRequest(new { Message = "Invalid or expired reset code" });
            }
            return Ok(new { Message = "Password reset successfully" });
        }
    }
}

