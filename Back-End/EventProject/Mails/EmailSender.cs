using System.Net.Mail;
using System.Net;

namespace EventProject.Mails
{
    public class EmailSender
    {
        public void sendMail(string to, string subject, string content)
        {
            SmtpClient smtpClient = new SmtpClient("smtp.gmail.com", 587);

            smtpClient.EnableSsl = true;
            smtpClient.UseDefaultCredentials = false;

            smtpClient.Credentials = new NetworkCredential("xaritona12@gmail.com", "wvpe quan khsm ejhq\r\n"); 
            MailMessage mailMessage = new MailMessage();
            mailMessage.From = new MailAddress("xaritona12@gmail.com");

            mailMessage.To.Add(to);
            mailMessage.Subject = subject;
            mailMessage.Body = content;
            mailMessage.IsBodyHtml = true;

            smtpClient.Send(mailMessage);
        }
    }
}
