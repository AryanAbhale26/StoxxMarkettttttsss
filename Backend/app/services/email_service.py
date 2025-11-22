import aiosmtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings

async def send_email(to_email: str, subject: str, body: str):
    """Send an email using SMTP"""
    try:
        message = MIMEMultipart("alternative")
        message["Subject"] = subject
        message["From"] = settings.SMTP_SENDER
        message["To"] = to_email
        
        html_part = MIMEText(body, "html")
        message.attach(html_part)
        
        await aiosmtplib.send(
            message,
            hostname=settings.SMTP_HOST,
            port=settings.SMTP_PORT,
            username=settings.SMTP_USER,
            password=settings.SMTP_PASSWORD,
            use_tls=True,
        )
        return True
    except Exception as e:
        print(f"Error sending email: {e}")
        return False

async def send_otp_email(to_email: str, otp: str, purpose: str = "password reset"):
    """Send OTP email"""
    subject = f"StockMaster - Your OTP for {purpose}"
    body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2563eb;">StockMaster</h2>
            <p>Hello,</p>
            <p>Your OTP for {purpose} is:</p>
            <h1 style="color: #2563eb; letter-spacing: 5px;">{otp}</h1>
            <p>This OTP will expire in {settings.OTP_EXPIRE_MINUTES} minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
            <br>
            <p>Best regards,<br>StockMaster Team</p>
        </body>
    </html>
    """
    return await send_email(to_email, subject, body)

async def send_welcome_email(to_email: str, full_name: str):
    """Send welcome email"""
    subject = "Welcome to StockMaster!"
    body = f"""
    <html>
        <body style="font-family: Arial, sans-serif; padding: 20px;">
            <h2 style="color: #2563eb;">Welcome to StockMaster!</h2>
            <p>Hello {full_name},</p>
            <p>Thank you for signing up with StockMaster - your complete inventory management solution.</p>
            <p>You can now:</p>
            <ul>
                <li>Manage products and stock levels</li>
                <li>Track receipts and deliveries</li>
                <li>Perform inventory adjustments</li>
                <li>Monitor stock movements across warehouses</li>
            </ul>
            <p>Get started by logging into your account!</p>
            <br>
            <p>Best regards,<br>StockMaster Team</p>
        </body>
    </html>
    """
    return await send_email(to_email, subject, body)
