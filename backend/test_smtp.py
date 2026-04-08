import smtplib
from email.mime.text import MIMEText
from dotenv import load_dotenv
import os

load_dotenv()

def test_smtp():
    user = os.getenv('MAIL_USERNAME')
    password = os.getenv('MAIL_PASSWORD')
    
    print(f"--- SMTP Diagnostic Tool ---")
    print(f"Testing with: {user}")
    
    msg = MIMEText("This is a test email from DecisionAI.")
    msg['Subject'] = "SMTP Test"
    msg['From'] = user
    msg['To'] = user
    
    try:
        # Try port 465 with SSL
        print("Connecting to smtp.gmail.com:465 (SSL)...")
        with smtplib.SMTP_SSL("smtp.gmail.com", 465) as server:
            server.login(user, password)
            server.send_message(msg)
            print("SUCCESS! SMTP connection and login worked.")
    except Exception as e:
        print(f"SSL Failed: {e}")
        try:
            # Try port 587 with TLS
            print("Connecting to smtp.gmail.com:587 (TLS)...")
            with smtplib.SMTP("smtp.gmail.com", 587) as server:
                server.starttls()
                server.login(user, password)
                server.send_message(msg)
                print("SUCCESS! SMTP connection (TLS) and login worked.")
        except Exception as e2:
            print(f"TLS Failed: {e2}")
            print("\nDIAGNOSIS:")
            print("1. Ensure 'Two-Factor Authentication' is ON in your Google Account.")
            print("2. Ensure you are using a 16-character 'App Password', NOT your regular Gmail password.")
            print("3. Check if your ISP blocks port 465 or 587.")

if __name__ == "__main__":
    test_smtp()
