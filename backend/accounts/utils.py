import random
from django.core.mail import send_mail
from django.conf import settings

def generate_otp():
    return str(random.randint(100000, 999999))

def send_otp_email(email, otp):
    try:
        subject = 'Your LoreStack Verification Code'
        message = f'Your verification code is {otp}. It will expire in 10 minutes.'
        email_from = settings.DEFAULT_FROM_EMAIL
        recipient_list = [email]
        send_mail(subject, message, email_from, recipient_list)
    except Exception as e:
        print(f"Failed to send email: {e}")
