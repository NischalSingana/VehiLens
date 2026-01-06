# AutoScan – Auto & Driver Identification System

A secure, scalable web application for police/authority use to manage and search auto-rickshaw driver records using text and AI-powered image search.

![AutoScan](https://img.shields.io/badge/Status-Production%20Ready-green)
![Next.js](https://img.shields.io/badge/Next.js-16.1-black)
![Python](https://img.shields.io/badge/Python-3.10+-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0+-green)

## 🎯 Features

- **📋 Auto Records Management**: Display and manage auto-rickshaw driver details with professional card layout
- **🔍 Text Search**: Search by vehicle number or driver name with debounced, real-time results
- **🖼️ AI-Powered Image Search**: Upload vehicle images for automatic number plate detection and recognition using YOLO + EasyOCR
- **👮 Admin Dashboard**: Secure admin panel to add and manage auto records
- **☁️ Cloud Storage**: Images stored in Cloudflare R2 for fast, reliable access
- **📱 Responsive Design**: Professional, mobile-friendly UI suitable for police/authority use

## 🏗️ Tech Stack

### Frontend
- **Next.js 16** - React framework with App Router
- **React 19** - UI library
- **Tailwind CSS 4** - Utility-first CSS framework
- **TypeScript** - Type-safe development

### Backend
- **Node.js** - Next.js API routes for database and storage operations
- **Python FastAPI** - AI processing service for YOLO + EasyOCR
- **MongoDB** - NoSQL database for auto records
- **Cloudflare R2** - S3-compatible object storage for images

### AI Models
- **YOLOv8** - Vehicle and number plate detection
- **EasyOCR** - Optical character recognition for number plates

## 📦 Installation

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+
- MongoDB (local or Atlas)
- Cloudflare R2 account (optional for image storage)

### 1. Clone the Repository

```bash
git clone <repository-url>
cd AutoScan
```

### 2. Setup Next.js Application

```bash
cd my-app
npm install
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env.local` and update with your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local`:

```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/autoscan

# Cloudflare R2
R2_ACCOUNT_ID=your_account_id
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=autoscan-images
R2_PUBLIC_URL=https://your-bucket.r2.dev

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Python AI Service
AI_SERVICE_URL=http://localhost:8000

# Next.js
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### 4. Initialize Database

```bash
npx tsx lib/db/init.ts
```

This creates the default admin user with credentials from your `.env.local` file.

### 5. Setup Python AI Service

```bash
cd ../ai-service
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

## 🚀 Running the Application

### Start MongoDB

If using local MongoDB:

```bash
mongod
```

### Start Python AI Service

```bash
cd ai-service
source venv/bin/activate
python main.py
```

The AI service will run on `http://localhost:8000`

### Start Next.js Development Server

```bash
cd my-app
npm run dev
```

The application will run on `http://localhost:3000`

## 📖 Usage

### 1. Access the Application

Open `http://localhost:3000` in your browser.

### 2. Home Page

- View all auto records in a responsive grid
- Use the search bar to find autos by vehicle number or driver name
- Navigate through pages using pagination controls

### 3. Image Search

- Click "Image Search" in the header
- Upload an image containing a vehicle with visible number plate
- The system will:
  1. Detect the vehicle using YOLO
  2. Extract the number plate text using EasyOCR
  3. Search the database for matching records
- View matched results with confidence scores

### 4. Admin Dashboard

- Click "Admin Login" in the header
- Login with credentials (default: `admin` / `admin123`)
- Add new auto records:
  - Enter driver name, vehicle number, and area
  - Upload auto image (max 5MB)
  - Submit to save to database and R2 storage
- View statistics and recent additions

## 🎨 UI/UX Features

- **Professional Police/Authority Theme**: Blue color scheme with clean, modern design
- **Glassmorphism Effects**: Subtle transparency and blur effects
- **Smooth Animations**: Hover effects, transitions, and loading states
- **Loading Skeletons**: Shimmer effect while data loads
- **Toast Notifications**: User-friendly success/error messages
- **Mobile Responsive**: Optimized for all device sizes

## 🔒 Security

- **Admin Authentication**: HTTP-only session cookies
- **Password Hashing**: bcrypt with salt rounds
- **Route Protection**: Middleware guards admin routes
- **Input Validation**: Zod schemas for all form inputs
- **Image Validation**: File type and size checks

## 📁 Project Structure

```
AutoScan/
├── my-app/                    # Next.js application
│   ├── app/                   # App router pages
│   │   ├── page.tsx          # Home page
│   │   ├── search-image/     # Image search page
│   │   ├── admin/            # Admin pages
│   │   └── api/              # API routes
│   ├── components/           # React components
│   ├── lib/                  # Utilities and database
│   │   ├── db/              # MongoDB models
│   │   ├── storage/         # R2 client
│   │   └── utils/           # Helpers
│   └── types/               # TypeScript types
│
└── ai-service/               # Python AI service
    ├── main.py              # FastAPI application
    ├── models/              # AI models
    │   ├── yolo_detector.py
    │   └── ocr_extractor.py
    └── requirements.txt
```

## 🧪 Testing

### Test MongoDB Connection

```bash
cd my-app
npx tsx lib/db/init.ts
```

### Test AI Service

```bash
curl http://localhost:8000/health
```

### Test Image Processing

```bash
curl -X POST http://localhost:8000/process-image \
  -F "file=@path/to/vehicle-image.jpg"
```

## 🐛 Troubleshooting

### MongoDB Connection Error

- Ensure MongoDB is running: `mongod`
- Check `MONGODB_URI` in `.env.local`
- For MongoDB Atlas, ensure IP whitelist is configured

### R2 Upload Fails

- Verify R2 credentials in `.env.local`
- Check bucket name and public URL
- Ensure bucket has public read access

### AI Service Not Responding

- Check if Python service is running on port 8000
- Verify `AI_SERVICE_URL` in `.env.local`
- Check Python dependencies are installed

### YOLO Model Not Found

The application uses a fallback detection method if YOLO model is not available. For better accuracy:

```bash
cd ai-service
# Download YOLOv8 nano model
python -c "from ultralytics import YOLO; YOLO('yolov8n.pt')"
```

## 🚢 Production Deployment

### Next.js

```bash
cd my-app
npm run build
npm start
```

### Python AI Service

Use Gunicorn or Docker:

```bash
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app
```

### Environment Variables

- Set `NODE_ENV=production`
- Use strong admin password
- Configure CORS for production domain
- Use MongoDB Atlas for database
- Enable R2 bucket security

## 📝 License

MIT License - see LICENSE file for details

## 👥 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for police and authority use**