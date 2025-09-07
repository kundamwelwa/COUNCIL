# Email Configuration Guide

## Yahoo Email Setup

To enable real email sending with your Yahoo email, follow these steps:

### 1. Enable App Passwords in Yahoo

1. Go to your Yahoo Account Security settings
2. Enable 2-Factor Authentication if not already enabled
3. Generate an App Password specifically for this application
4. Copy the generated app password (it will look like: `abcd efgh ijkl mnop`)

### 2. Create .env file

Create a `.env` file in the `backend` directory with the following content:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=beneficiaries_db
DB_USER=postgres
DB_PASSWORD=Council@2025

# JWT Secret (Change this in production)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production-2024

# Email Configuration (Yahoo SMTP)
USE_REAL_EMAIL=true
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-yahoo-email@yahoo.com
SMTP_PASS=your-yahoo-app-password

# Frontend URL
FRONTEND_URL=http://localhost:3000

# Environment
NODE_ENV=development
```

### 3. Replace the following values:

- `your-yahoo-email@yahoo.com` - Replace with your actual Yahoo email address
- `your-yahoo-app-password` - Replace with the app password you generated
- `your-super-secret-jwt-key-change-this-in-production-2024` - Replace with a strong, random secret key

### 4. Yahoo SMTP Settings

- **Host**: smtp.mail.yahoo.com
- **Port**: 587
- **Security**: STARTTLS (not SSL)
- **Authentication**: Required

### 5. Test the Configuration

After setting up the `.env` file, restart your backend server:

```bash
cd backend
npm run dev
```

You should see:
```
📧 Email service initialized (Real Email Mode - Yahoo SMTP)
```

### 6. Troubleshooting

If you encounter issues:

1. **Authentication Failed**: Double-check your email and app password
2. **Connection Timeout**: Ensure your firewall allows outbound connections on port 587
3. **SSL/TLS Errors**: Make sure `SMTP_SECURE=false` and `SMTP_PORT=587`

### 7. Security Notes

- Never commit the `.env` file to version control
- Use app passwords instead of your main Yahoo password
- Rotate app passwords regularly
- In production, use environment variables or a secure secrets management system

### 8. Alternative Email Providers

If you prefer to use a different email provider:

#### Gmail
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-gmail@gmail.com
SMTP_PASS=your-gmail-app-password
```

#### Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

## Testing Email Functionality

Once configured, you can test the email system by:

1. Registering a new user
2. Checking your Yahoo inbox for the verification email
3. Clicking the verification link
4. Testing password reset functionality

The system will send:
- Email verification links when users register
- Password reset links when users request password reset
- Welcome emails after successful verification
