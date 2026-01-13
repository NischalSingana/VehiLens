from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from models.yolo_detector import detect_vehicle_and_plate
from models.ocr_extractor import extract_text_with_preprocessing
import io
from PIL import Image
import numpy as np

app = FastAPI(title="VehiLens AI Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your Next.js domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "service": "VehiLens AI Service",
        "status": "running",
        "endpoints": ["/process-image"]
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

@app.post("/process-image")
async def process_image(file: UploadFile = File(...)):
    """
    Process an uploaded image to detect vehicle and extract number plate text.
    """
    try:
        # Validate file type
        if not file.content_type.startswith('image/'):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Read image file
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        image_np = np.array(image)
        
        # Step 1: Detect vehicle and number plate using YOLO
        detection_result = detect_vehicle_and_plate(image_np)
        
        if not detection_result:
            return {
                "vehicle_number": None,
                "vehicleNumber": None,
                "confidence": 0.0,
                "status": "not_found",
                "error": "No vehicle/plate detected"
            }
        
        plate_image = detection_result['plate_image']
        detection_box = detection_result['box']
        
        # Step 2: Extract text using enhanced OCR pipeline
        ocr_result = extract_text_with_preprocessing(plate_image)
        
        if not ocr_result:
             return {
                "vehicle_number": None,
                "vehicleNumber": None,
                "confidence": 0.0,
                "status": "ocr_failed",
                "detection_box": detection_box
            }
        
        status = "matched" if ocr_result['confidence'] >= 0.6 else "low_confidence"
        
        return {
            "vehicle_number": ocr_result['text'],
            "vehicleNumber": ocr_result['text'], # Backwards compatibility
            "confidence": ocr_result['confidence'],
            "status": status,
            "detection_box": detection_box,
            "debug": ocr_result.get('debug', {})
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Processing error: {e}")
        # Return error as JSON to avoid 500 crashes
        return {
            "error": str(e),
            "status": "error"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
