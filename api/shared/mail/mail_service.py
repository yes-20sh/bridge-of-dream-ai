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

def _load_template(filename: str, **kwargs) -> str:
    filepath = os.path.join(TEMPLATE_DIR, filename)
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()
    return content.format(**kwargs)

def _send_email(to_email: str, subject: str, html_body: str):
    """Internal helper to send email via Gmail SMTP"""
    if not GMAIL_SENDER or not GMAIL_APP_PASSWORD:
        logger.warning(f"SMTP credentials not configured. Skipping email to {to_email}.")
        return

    msg = MIMEMultipart("alternative")
    msg['Subject'] = subject
    msg['From'] = GMAIL_SENDER
    msg['To'] = to_email

    part1 = MIMEText(html_body, 'html')
    msg.attach(part1)

    try:
        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(GMAIL_SENDER, GMAIL_APP_PASSWORD)
        server.sendmail(GMAIL_SENDER, to_email, msg.as_string())
        server.quit()
        logger.info(f"Email sent successfully to {to_email}")
    except Exception as e:
        logger.exception(f"Failed to send email to {to_email}: {e}")

def send_approval_email(to_email: str, name: str, password: str, jwt_token: str):
    """Send an approval email with generated password and token."""
    subject = "Your Request for Platform Access has been Approved!"
    html_body = _load_template("approval.html", name=name, to_email=to_email, password=password, jwt_token=jwt_token)
    _send_email(to_email, subject, html_body)

def send_rejection_email(to_email: str, name: str):
    """Send a rejection email."""
    subject = "Update regarding your Platform Access Request"
    html_body = _load_template("rejection.html", name=name)
    _send_email(to_email, subject, html_body)
