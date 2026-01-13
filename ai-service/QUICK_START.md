# 🎉 VehiLens API - Quick Reference Guide

## ✅ Current Status

**YOLO:** ✅ Working  
**EasyOCR:** ✅ Working  
**API Server:** ✅ Running on http://localhost:8000  

---

## 🚀 Quick Start

### Start the Server
```bash
cd /Users/nischalsingana/DEV/VehiLens/ai-service
source venv/bin/activate
python main.py
```

### Test the API
```bash
# Health check
curl http://localhost:8000/health

# Process an image
curl -X POST http://localhost:8000/process-image \
  -F "file=@/path/to/vehicle_image.jpg"
```

---

## 📡 API Endpoints

### 1. Root
```
GET http://localhost:8000/
```

### 2. Health Check
```
GET http://localhost:8000/health
```

### 3. Process Image (Main Endpoint)
```
POST http://localhost:8000/process-image
Content-Type: multipart/form-data
Body: file (image)
```

**Response:**
```json
{
  "vehicleNumber": "MH 12 AB 1234",
  "confidence": 0.85,
  "detectionBox": [x, y, width, height]
}
```

---

## 🔗 Next.js Integration

Update your Next.js API route to call this service:

```typescript
// In your Next.js app
const formData = new FormData();
formData.append('file', imageFile);

const response = await fetch('http://localhost:8000/process-image', {
  method: 'POST',
  body: formData,
});

const result = await response.json();
console.log('Vehicle Number:', result.vehicleNumber);
```

---

## 📝 Test Scripts

- `test_setup.py` - Verify YOLO and EasyOCR installation
- `test_api.py` - Comprehensive API testing
- `quick_test.py` - Quick API test with images

---

## 🔧 Troubleshooting

### Server not starting?
```bash
# Make sure you're in the virtual environment
source venv/bin/activate

# Check if port 8000 is available
lsof -i :8000
```

### Low detection accuracy?
- Use real vehicle images (not AI-generated)
- Consider using a specialized license plate detection model
- Adjust confidence threshold in `yolo_detector.py`

---

## 📚 Documentation

Full API docs available at: http://localhost:8000/docs

---

**Created:** January 6, 2026  
**Version:** 1.0.0
