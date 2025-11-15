using EventProject.Data;
using EventProject.Models;
using EventProject.Services.Abstraction;
using BCrypt;
using EventProject.Mails;
using EventProject.Request;
using EventProject.Enum;

namespace EventProject.Services.Implementation
{
    public class UserService : IUserService
    {
        private readonly DataContexcs _context;

        public UserService(DataContexcs context)
        {
            _context = context;
        }
        public bool ResendVerificationCode(string email)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);

            if (user == null || user.HasConfirmed)
            {
                return false;
            }

            // გენერირდება ახალი კოდი
            string newCode = new Random().Next(1000, 9999).ToString();
            user.ConfirmationCode = newCode;

            _context.SaveChanges();

            EmailSender sender = new EmailSender();
            sender.sendMail(email, "Verification Code", $"Your code is: {newCode}");

            return true;
        }


        public User AddUser(UserDTO req)
        {
            var userExists = _context.Users.FirstOrDefault(u => u.Email == req.Email);

            if (userExists == null)
            {
                User user = new User
                {
                    Email = req.Email,
                    Username = req.Username,
                    LastName = req.LastName,
                    FirstName = req.FirstName,
                    // ადმინის მეილის განსაზღვრა
                    Role = req.Email == "xaritona12@gmail.com" ? UserRole.ADMIN : UserRole.PARTICIPANT
                };

                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(req.Password);
                user.HasConfirmed = false;

                Random rand = new Random();
                user.ConfirmationCode = rand.Next(1000, 9999).ToString();

                EmailSender sender = new EmailSender();
                sender.sendMail(req.Email, "Verification", $@"<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'/><meta name='viewport' content='width=device-width, initial-scale=1.0'/><title>Email Verification</title><style>body {{font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6fa; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #333;}} .container {{max-width: 600px; background-color: #fff; margin: 40px auto; padding: 40px 30px; border-radius: 12px; box-shadow: 0 8px 30px rgba(138, 43, 226, 0.15); border-top: 6px solid #8a2be2;}} .header {{text-align: center; color: #8a2be2; margin-bottom: 35px;}} .header h1 {{margin: 0; font-size: 2.8rem; font-weight: 700; letter-spacing: 1.5px;}} p {{font-size: 1.1rem; line-height: 1.6; margin: 0 0 20px 0;}} .verification-box {{background: linear-gradient(90deg, #8a2be2, #9370db); padding: 30px; border-radius: 10px; text-align: center; margin: 25px 0; box-shadow: 0 4px 12px rgba(138, 43, 226, 0.3);}} .verification-code {{font-size: 3.5rem; letter-spacing: 14px; color: #fff; font-weight: 900; font-family: 'Courier New', Courier, monospace; user-select: all;}} .message {{color: #666; font-size: 0.95rem; margin-top: 30px; text-align: center;}} .footer {{text-align: center; margin-top: 40px; font-size: 0.9rem; color: #aaa; border-top: 1px solid #eee; padding-top: 20px; font-style: italic; letter-spacing: 0.4px;}} @media (max-width: 480px) {{.container {{padding: 30px 20px;}} .verification-code {{font-size: 2.5rem; letter-spacing: 10px;}} .header h1 {{font-size: 2rem;}}}}</style></head><body><div class='container'><div class='header'><h1>Email Verification</h1></div><p>Hello {req.FirstName ?? req.Username},</p><p>Thank you for registering with our service. Please use the verification code below to complete your registration:</p><div class='verification-box'><div class='verification-code'>{user.ConfirmationCode}</div></div><p class='message'>This code will expire in 10 minutes. If you did not request this code, please ignore this email.</p><div class='footer'><p>&copy; {DateTime.Now.Year} Your Company. All rights reserved.</p></div></div></body></html>");

                _context.Users.Add(user);
                _context.SaveChanges();

                return user;
            }
            else
            {
                return null;
            }
        }

        public User GetProfile(int id)
        {
            var user = _context.Users.FirstOrDefault(u => u.Id == id);
            if (user == null)
            {
                return null;
            }
            else
            {
                if (user.HasConfirmed == true)
                {
                    return user;
                }
                else
                {
                    return null;
                }
            }
        }

        public List<User> GetUsers()
        {
            return _context.Users.ToList();
        }

        public User Login(string email, string password)
        {
            var user = _context.Users.FirstOrDefault(x => x.Email == email);

            if (user == null || user.HasConfirmed == false)
            {
                return null;
            }
            else
            {
                if (BCrypt.Net.BCrypt.Verify(password, user.PasswordHash))
                {
                    return user;
                }
                else
                {
                    return null;
                }
            }
        }

        public bool VerifyUser(string email, string code)
        {
            if (email == null || code == null)
            {
                return false;
            }
            else
            {
                var userExists = _context.Users.FirstOrDefault(u => u.Email == email);

                if (userExists == null)
                {
                    return false;
                }
                else
                {
                    if (userExists.ConfirmationCode == code)
                    {
                        userExists.HasConfirmed = true;
                        userExists.ConfirmationCode = null;

                        _context.SaveChanges();

                        return true;
                    }
                    else
                    {
                        return false;
                    }
                }
            }
        }
        public bool RequestPasswordReset(string email)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);

            if (user == null || !user.HasConfirmed)
            {
                return false;
            }

            // შეიქმნება 6-ნიშნა კოდი პაროლის აღსადგენად
            string resetCode = new Random().Next(100000, 999999).ToString();
            user.PasswordResetCode = resetCode;
            user.PasswordResetCodeExpiry = DateTime.Now.AddMinutes(15); // 15 წუთით მოქმედი

            _context.SaveChanges();

            EmailSender sender = new EmailSender();
            sender.sendMail(email, "Password Reset Code", $@"<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'/><meta name='viewport' content='width=device-width, initial-scale=1.0'/><title>Password Reset</title><style>body {{font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6fa; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #333;}} .container {{max-width: 600px; background-color: #fff; margin: 40px auto; padding: 40px 30px; border-radius: 12px; box-shadow: 0 8px 30px rgba(138, 43, 226, 0.15); border-top: 6px solid #8a2be2;}} .header {{text-align: center; color: #8a2be2; margin-bottom: 35px;}} .header h1 {{margin: 0; font-size: 2.8rem; font-weight: 700; letter-spacing: 1.5px;}} p {{font-size: 1.1rem; line-height: 1.6; margin: 0 0 20px 0;}} .reset-box {{background: linear-gradient(90deg, #8a2be2, #9370db); padding: 30px; border-radius: 10px; text-align: center; margin: 25px 0; box-shadow: 0 4px 12px rgba(138, 43, 226, 0.3);}} .reset-code {{font-size: 3.5rem; letter-spacing: 14px; color: #fff; font-weight: 900; font-family: 'Courier New', Courier, monospace; user-select: all;}} .message {{color: #666; font-size: 0.95rem; margin-top: 30px; text-align: center;}} .footer {{text-align: center; margin-top: 40px; font-size: 0.9rem; color: #aaa; border-top: 1px solid #eee; padding-top: 20px; font-style: italic; letter-spacing: 0.4px;}} @media (max-width: 480px) {{.container {{padding: 30px 20px;}} .reset-code {{font-size: 2.5rem; letter-spacing: 10px;}} .header h1 {{font-size: 2rem;}}}}</style></head><body><div class='container'><div class='header'><h1>Password Reset</h1></div><p>Hello {user.FirstName ?? user.Username},</p><p>You have requested a password reset. Please use the code below to reset your password:</p><div class='reset-box'><div class='reset-code'>{resetCode}</div></div><p class='message'>This code will expire in 15 minutes. If you did not request this reset, please ignore this email.</p><div class='footer'><p>&copy; {DateTime.Now.Year} Your Company. All rights reserved.</p></div></div></body></html>");

            return true;
        }

        public bool VerifyPasswordResetCode(string email, string code)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(code))
            {
                return false;
            }

            var user = _context.Users.FirstOrDefault(u => u.Email == email);

            if (user == null || !user.HasConfirmed)
            {
                return false;
            }

            if (user.PasswordResetCode == code && user.PasswordResetCodeExpiry > DateTime.Now)
            {
                return true;
            }

            return false;
        }

        public bool ResetPassword(string email, string code, string newPassword)
        {
            if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(code) || string.IsNullOrEmpty(newPassword))
            {
                return false;
            }

            var user = _context.Users.FirstOrDefault(u => u.Email == email);

            if (user == null || !user.HasConfirmed)
            {
                return false;
            }

            // შემოწმდება კოდი და ვადა
            if (user.PasswordResetCode == code && user.PasswordResetCodeExpiry > DateTime.Now)
            {
                // ახალი პაროლის დაცვა
                user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
                user.PasswordResetCode = null;
                user.PasswordResetCodeExpiry = null;

                _context.SaveChanges();

                // დასტური ი-მეილი
                EmailSender sender = new EmailSender();
                sender.sendMail(email, "Password Reset Successful", $@"<!DOCTYPE html><html lang='en'><head><meta charset='UTF-8'/><meta name='viewport' content='width=device-width, initial-scale=1.0'/><title>Password Reset Successful</title><style>body {{font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f6fa; margin: 0; padding: 0; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; color: #333;}} .container {{max-width: 600px; background-color: #fff; margin: 40px auto; padding: 40px 30px; border-radius: 12px; box-shadow: 0 8px 30px rgba(138, 43, 226, 0.15); border-top: 6px solid #28a745;}} .header {{text-align: center; color: #28a745; margin-bottom: 35px;}} .header h1 {{margin: 0; font-size: 2.8rem; font-weight: 700; letter-spacing: 1.5px;}} p {{font-size: 1.1rem; line-height: 1.6; margin: 0 0 20px 0;}} .success-box {{background: linear-gradient(90deg, #28a745, #32c754); padding: 30px; border-radius: 10px; text-align: center; margin: 25px 0; box-shadow: 0 4px 12px rgba(40, 167, 69, 0.3);}} .success-icon {{font-size: 3rem; color: #fff; margin-bottom: 10px;}} .success-message {{font-size: 1.2rem; color: #fff; font-weight: 600;}} .message {{color: #666; font-size: 0.95rem; margin-top: 30px; text-align: center;}} .footer {{text-align: center; margin-top: 40px; font-size: 0.9rem; color: #aaa; border-top: 1px solid #eee; padding-top: 20px; font-style: italic; letter-spacing: 0.4px;}} @media (max-width: 480px) {{.container {{padding: 30px 20px;}} .header h1 {{font-size: 2rem;}}}}</style></head><body><div class='container'><div class='header'><h1>Password Reset Successful</h1></div><p>Hello {user.FirstName ?? user.Username},</p><p>Your password has been successfully reset. You can now login with your new password.</p><div class='success-box'><div class='success-icon'>✓</div><div class='success-message'>Password Updated Successfully</div></div><p class='message'>If you did not make this change, please contact support immediately.</p><div class='footer'><p>&copy; {DateTime.Now.Year} Your Company. All rights reserved.</p></div></div></body></html>");

                return true;
            }

            return false;
        }

        public bool AssignAdminRole(string email)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            if (user == null || user.Role == UserRole.ADMIN) return false;

            user.Role = UserRole.ADMIN;
            _context.SaveChanges();
            return true;
        }

        public bool RemoveAdminRole(string email)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == email);
            if (user == null || user.Role != UserRole.ADMIN) return false;

            user.Role = UserRole.PARTICIPANT;
            _context.SaveChanges();
            return true;
        }

        public List<User> GetAdmins()
        {
            return _context.Users.Where(u => u.Role == UserRole.ADMIN).ToList();
        }



    }
}

  
