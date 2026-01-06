from ultralytics import YOLO
import cv2
import numpy as np
import os
from typing import Optional, Dict

# Load YOLO model
model = None

def load_model():
    """Load the YOLOv8 model"""
    global model
    if model is None:
        try:
            # Check for specialized model first
            model_path = os.path.join(os.path.dirname(__file__), 'license_plate_detector.pt')
            if not os.path.exists(model_path):
                print("⚠️ Specialized model not found, falling back to yolov8n.pt")
                model_path = 'yolov8n.pt'
            else:
                print(f"✅ Loading specialized model from {model_path}")
            
            model = YOLO(model_path)
            print("✅ YOLO model loaded successfully")
        except Exception as e:
            print(f"⚠️  Warning: Could not load YOLO model: {e}")
            print("Using fallback detection method")
    return model

def validate_crop(box, image_shape):
    """
    Validate if the crop is reasonable for a license plate.
    Plate should be roughly rectangular with aspect ratio > 1.2
    """
    x1, y1, x2, y2 = box
    width = x2 - x1
    height = y2 - y1
    
    if width <= 0 or height <= 0:
        return False
        
    aspect_ratio = width / height
    
    # Indian plates are usually 4:1 or 2:1 depending on vehicle
    # Allow a wide range but reject vertical crops or squares (unless multiline, but usually >1.2)
    if aspect_ratio < 1.0 or aspect_ratio > 6.0:
        return False
        
    # Minimum size check (too small to read)
    if width < 50 or height < 15:
        return False
        
    return True

def detect_vehicle_and_plate(image: np.ndarray) -> Optional[Dict]:
    """
    Detect number plate using specialized YOLO model.
    Returns the plate image and bounding box.
    """
    try:
        # Convert RGBA to RGB if needed
        if len(image.shape) == 3 and image.shape[2] == 4:
            image = cv2.cvtColor(image, cv2.COLOR_BGRA2BGR)
        
        yolo_model = load_model()
        
        if yolo_model is None:
            return detect_plate_fallback(image)
        
        # Run detection
        # Class 0 is usually the only class for a specialized model (number_plate)
        results = yolo_model(image, conf=0.25)
        
        best_plate = None
        max_conf = 0
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                # Get coordinates
                x1, y1, x2, y2 = map(int, box.xyxy[0].cpu().numpy())
                conf = float(box.conf[0].cpu().numpy())
                
                # Check crop quality
                if not validate_crop([x1, y1, x2, y2], image.shape):
                    continue
                
                if conf > max_conf:
                    max_conf = conf
                    
                    # Tight cropping as requested (minimal padding)
                    # The model detects the PLATE, so we rely on that.
                    # Add tiny padding (2%) just to avoid cutting edge characters
                    h, w = image.shape[:2]
                    pad_x = int((x2 - x1) * 0.02)
                    pad_y = int((y2 - y1) * 0.02)
                    
                    crop_x1 = max(0, x1 - pad_x)
                    crop_y1 = max(0, y1 - pad_y)
                    crop_x2 = min(w, x2 + pad_x)
                    crop_y2 = min(h, y2 + pad_y)
                    
                    plate_img = image[crop_y1:crop_y2, crop_x1:crop_x2]
                    
                    best_plate = {
                        'plate_image': plate_img,
                        'box': [crop_x1, crop_y1, crop_x2 - crop_x1, crop_y2 - crop_y1],
                        'confidence': conf
                    }
        
        if best_plate:
            return best_plate
            
        return detect_plate_fallback(image)
            
    except Exception as e:
        print(f"YOLO detection error: {e}")
        return detect_plate_fallback(image)

def detect_plate_fallback(image: np.ndarray) -> Optional[Dict]:
    """
    Fallback method using traditional CV.
    """
    try:
        gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
        edges = cv2.Canny(gray, 100, 200)
        contours, _ = cv2.findContours(edges, cv2.RETR_TREE, cv2.CHAIN_APPROX_SIMPLE)
        contours = sorted(contours, key=cv2.contourArea, reverse=True)[:10]
        
        for contour in contours:
            peri = cv2.arcLength(contour, True)
            approx = cv2.approxPolyDP(contour, 0.02 * peri, True)
            if len(approx) == 4:
                x, y, w, h = cv2.boundingRect(approx)
                aspect_ratio = w / float(h)
                if 2.0 < aspect_ratio < 5.0:
                    plate_image = image[y:y+h, x:x+w]
                    return {
                        'plate_image': plate_image,
                        'box': [x, y, w, h],
                        'confidence': 0.6
                    }
        
        # Absolute fallback: Center crop
        h, w = image.shape[:2]
        x, y = w // 4, h // 2
        w, h = w // 2, h // 4
        plate_image = image[y:y+h, x:x+w]
        return {
            'plate_image': plate_image,
            'box': [x, y, w, h],
            'confidence': 0.4
        }
    except Exception as e:
        print(f"Fallback detection error: {e}")
        return None
