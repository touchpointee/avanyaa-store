# Quick Setup Guide

## Windows Setup Instructions

### 1. Install Prerequisites

**Node.js**
```powershell
# Download and install Node.js 18+ from nodejs.org
# Verify installation
node --version
npm --version
```

**MongoDB**
```powershell
# Option A: MongoDB Community Server
# Download from: https://www.mongodb.com/try/download/community
# Install and add to PATH

# Option B: MongoDB Atlas (Cloud - Recommended for beginners)
# Sign up at mongodb.com/cloud/atlas - Free tier available
```

**MinIO**
```powershell
# Download MinIO for Windows
# Visit: https://min.io/download

# Or using PowerShell
Invoke-WebRequest -Uri "https://dl.min.io/server/minio/release/windows-amd64/minio.exe" -OutFile "C:\minio\minio.exe"

# Run MinIO
cd C:\minio
.\minio.exe server C:\minio-data --console-address ":9001"

# Access MinIO console at http://localhost:9001
# Login: minioadmin / minioadmin
```

### 2. Project Setup

```powershell
# Navigate to project directory
cd C:\Users\ajmal\Desktop\touchpointe\AVANYAA

# Install dependencies
npm install

# Copy environment file
copy .env.example .env
```

### 3. Configure Environment Variables

Edit `.env` file with these values:

**MongoDB (Choose one):**
```env
# Local MongoDB
MONGODB_URI=mongodb://localhost:27017/avanyaa-fashion

# OR MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/avanyaa-fashion
```

**MinIO:**
```env
MINIO_ENDPOINT=localhost
MINIO_PORT=9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=avanyaa-images
MINIO_USE_SSL=false
```

**Generate NextAuth Secret:**
```powershell
# In PowerShell
$bytes = New-Object byte[] 32
(New-Object Security.Cryptography.RNGCryptoServiceProvider).GetBytes($bytes)
[Convert]::ToBase64String($bytes)

# Copy output to .env
NEXTAUTH_SECRET=<generated-secret>
NEXTAUTH_URL=http://localhost:3000
```

**Email (Choose one):**
```env
# Resend (Recommended - sign up at resend.com)
RESEND_API_KEY=re_xxxxxxxxxxxxx

# OR Gmail SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
```

**Admin Email:**
```env
ADMIN_EMAIL=admin@avanyaa.com
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Start Services

**Terminal 1 - MongoDB (if local):**
```powershell
mongod --dbpath C:\data\db
```

**Terminal 2 - MinIO:**
```powershell
cd C:\minio
.\minio.exe server C:\minio-data --console-address ":9001"
```

**Terminal 3 - Next.js App:**
```powershell
cd C:\Users\ajmal\Desktop\touchpointe\AVANYAA
npm run dev
```

### 5. Access the Application

- **App:** http://localhost:3000
- **MinIO Console:** http://localhost:9001

### 6. Create Admin User

1. Go to http://localhost:3000
2. Click "Sign Up" and create an account
3. Open MongoDB (use MongoDB Compass or mongosh)
4. Update user role to admin:

**Using MongoDB Compass:**
- Connect to `mongodb://localhost:27017`
- Database: `avanyaa-fashion`
- Collection: `users`
- Find your user and edit
- Change `role` from `"user"` to `"admin"`

**Using mongosh:**
```powershell
mongosh mongodb://localhost:27017/avanyaa-fashion

db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

5. Log out and log back in
6. Access admin panel at http://localhost:3000/admin

### 7. Add Sample Products

1. Log in as admin
2. Go to Admin > Products
3. Click "Add Product"
4. Fill in details:
   - Name, description, price
   - Select category
   - Choose sizes and colors
   - Upload images (from MinIO)
   - Set stock
5. Save product

### Common Issues & Solutions

**Port already in use:**
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <process-id> /F
```

**MongoDB connection error:**
- Check if MongoDB service is running
- Verify connection string in .env
- For Atlas: Whitelist your IP address

**MinIO connection error:**
- Check if MinIO is running on port 9000
- Verify MINIO_* variables in .env
- Create bucket named `avanyaa-images` in MinIO console

**Image upload fails:**
- Ensure MinIO is running
- Check bucket exists and is public
- Verify MinIO credentials in .env

**Email not sending:**
- Check email credentials
- For Gmail: Use app password, not regular password
- For Resend: Verify API key is correct

### Development Tips

**Hot Reload Issues:**
```powershell
# Clear Next.js cache
rm -r .next
npm run dev
```

**Reset Database:**
```powershell
mongosh mongodb://localhost:27017/avanyaa-fashion
db.dropDatabase()
```

**View Logs:**
- Check terminal running `npm run dev`
- Check browser console (F12)
- Check MongoDB logs
- Check MinIO logs

### Production Deployment

See README.md for Vercel deployment instructions.

For production, update:
- Use MongoDB Atlas (not local)
- Use production MinIO instance
- Set `MINIO_USE_SSL=true`
- Generate strong `NEXTAUTH_SECRET`
- Configure production domain in `NEXTAUTH_URL`
