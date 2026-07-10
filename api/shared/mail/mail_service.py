import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
import logging

logger = logging.getLogger(__name__)

SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", 587))
GMAIL_SENDER = os.environ.get("SMTP_USERNAME")
GMAIL_APP_PASSWORD = os.environ.get("SMTP_PASSWORD")

TEMPLATE_DIR = os.path.join(os.path.dirname(__file__), "template")

class MailTemplate:
    @staticmethod
    def _load_template(filename: str, **kwargs) -> str:
        filepath = os.path.join(TEMPLATE_DIR, filename)
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()
        for key, val in kwargs.items():
            content = content.replace(f"{{{key}}}", str(val))
        return content

    @staticmethod
    def _send_email(to_email: str, subject: str, html_body: str):
        """Internal helper to send email via Gmail SMTP"""
        if not GMAIL_SENDER or not GMAIL_APP_PASSWORD:
            logger.warning(f"SMTP credentials not configured. Skipping email to {to_email}.")
            return

        msg = MIMEMultipart("alternative")
        msg['Subject'] = subject
        msg['From'] = GMAIL_SENDER
        msg['To'] = to_email

        part_html = MIMEText(html_body, 'html')
        msg.attach(part_html)

        try:
            server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
            server.starttls()
            server.login(GMAIL_SENDER, GMAIL_APP_PASSWORD)
            server.sendmail(GMAIL_SENDER, to_email, msg.as_string())
            server.quit()
            logger.info(f"Email sent successfully to {to_email}")
        except Exception as e:
            logger.exception(f"Failed to send email to {to_email}: {e}")

    @classmethod
    def send_approval_email(cls, to_email: str, name: str, password: str):
        """Send an approval email with generated password."""
        subject = "Your Request for Platform Access has been Approved!"
        logo_url = "https://res.cloudinary.com/wpv8brim/image/upload/v1783616280/j4wztuwamgvqbakjnn0w.jpg"
        html_body = cls._load_template("approval.html", name=name, to_email=to_email, password=password, logo_url=logo_url)
        cls._send_email(to_email, subject, html_body)

    @classmethod
    def send_rejection_email(cls, to_email: str, name: str):
        """Send a rejection email."""
        subject = "Update regarding your Platform Access Request"
        logo_url = "https://res.cloudinary.com/wpv8brim/image/upload/v1783616280/j4wztuwamgvqbakjnn0w.jpg"
        html_body = cls._load_template("rejection.html", name=name, logo_url=logo_url)
        cls._send_email(to_email, subject, html_body)

    @classmethod
    def send_admin_request_approval_email(cls, admin_email: str, request_id: str, name: str, email: str, mobile_number: str, description: str):
        """Send an approval request email to the administrator."""
        subject = f"Action Required: New Access Request Submitted by {name}"
        logo_url = "https://res.cloudinary.com/wpv8brim/image/upload/v1783616280/j4wztuwamgvqbakjnn0w.jpg"
        backend_url = os.environ.get("BACKEND_URL", "http://localhost:8000")
        
        html_body = cls._load_template(
            "admin_request.html",
            name=name,
            email=email,
            mobile_number=mobile_number,
            description=description,
            request_id=request_id,
            backend_url=backend_url,
            logo_url=logo_url
        )
        cls._send_email(admin_email, subject, html_body)

    @classmethod
    def send_password_reset_otp_email(cls, to_email: str, name: str, otp_code: str):
        """Send a password reset OTP email."""
        subject = "Password Reset OTP"
        logo_url = "https://res.cloudinary.com/wpv8brim/image/upload/v1783616280/j4wztuwamgvqbakjnn0w.jpg"
        html_body = cls._load_template("password_reset_otp.html", name=name, otp_code=otp_code, logo_url=logo_url)
        cls._send_email(to_email, subject, html_body)
