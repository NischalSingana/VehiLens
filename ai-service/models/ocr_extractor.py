import easyocr
import numpy as np
import cv2
import re
from typing import Optional, Dict, List

# Initialize EasyOCR reader
reader = None

def load_reader():
    """Load EasyOCR reader with whitelist"""
    global reader
    if reader is None:
        try:
            # Initialize with whitelist (English only)
            reader = easyocr.Reader(['en'], gpu=False)
            print("✅ EasyOCR reader loaded successfully")
        except Exception as e:
            print(f"❌ Error loading EasyOCR: {e}")
    return reader

def preprocess_plate_for_ocr(plate_image: np.ndarray, method='standard') -> np.ndarray:
    """
    Preprocess license plate image based on method
    """
    try:
        # Convert to grayscale
        if len(plate_image.shape) == 3:
            gray = cv2.cvtColor(plate_image, cv2.COLOR_BGR2GRAY)
        else:
            gray = plate_image.copy()
            
        # Standard: Bilateral -> Adaptive Threshold
        if method == 'standard':
            denoised = cv2.bilateralFilter(gray, 11, 17, 17)
            thresh = cv2.adaptiveThreshold(
                denoised, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, 
                cv2.THRESH_BINARY, 11, 2
            )
            
        # Enhanced: Enhance Contrast -> Threshold
        elif method == 'enhanced':
            # CLAHE (Contrast Limited Adaptive Histogram Equalization)
            clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8,8))
            enhanced = clahe.apply(gray)
            thresh = cv2.adaptiveThreshold(
                enhanced, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                cv2.THRESH_BINARY, 11, 2
            )
            
        # Otsu: Guassian Blur -> Otsu Thresholding
        elif method == 'otsu':
            blur = cv2.GaussianBlur(gray, (5,5), 0)
            _, thresh = cv2.threshold(blur, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
            
        else:
            return gray

        # Morphological close to fill gaps
        kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (3, 3))
        morph = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel)
        
        # Resize if too small (height < 60)
        h, w = morph.shape
        if h < 60:
            scale = 60 / h
            morph = cv2.resize(morph, (int(w * scale), 60))
            
        return morph
        
    except Exception as e:
        print(f"Preprocessing error ({method}): {e}")
        return plate_image

def validate_indian_plate(text: str) -> bool:
    """
    Validate if text matches Indian license plate patterns.
    Regex: ^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$
    """
    if not text:
        return False
        
    # Standard format: KA01AB1234 or KA01A1234
    # State (2 chars) + District (1-2 digits) + Series (1-2 chars) + Number (4 digits)
    pattern = r'^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$'
    return bool(re.match(pattern, text))

def clean_ocr_text(text: str) -> str:
    """Clean OCR text: remove spaces, special chars"""
    return re.sub(r'[^A-Z0-9]', '', text.upper())

def calculate_confidence(ocr_conf: float, regex_valid: bool) -> float:
    """
    Calculate final confidence score.
    OCR: 60%, Regex: 30%, Base Area/Quality: 10% (assumed high if detection worked)
    """
    score = ocr_conf * 0.6
    if regex_valid:
        score += 0.3
    # Add base score for detection quality implies by reaching here
    score += 0.1
    return round(min(score, 1.0), 2)

def extract_text_with_preprocessing(plate_image: np.ndarray) -> Optional[Dict]:
    """
    Multi-pass OCR extraction
    """
    ocr_reader = load_reader()
    if ocr_reader is None:
        return None
        
    best_result = {
        'text': '',
        'confidence': 0.0,
        'raw_text': '',
        'debug': {'attempts': 0}
    }
    
    methods = ['standard', 'enhanced', 'otsu']
    
    for method in methods:
        try:
            processed = preprocess_plate_for_ocr(plate_image, method)
            
            # Allowlist for alphanumeric
            results = ocr_reader.readtext(
                processed, 
                allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
                detail=1
            )
            
            if not results:
                continue
                
            # Combine text and avg confidence
            raw_text = ''.join([r[1] for r in results])
            # Only consider high confidence characters
            confidences = [r[2] for r in results]
            avg_ocr_conf = sum(confidences) / len(confidences) if confidences else 0
            
            cleaned = clean_ocr_text(raw_text)
            
            # FORCE AP STATE CODE (User Requirement)
            # "anyways all will be in AP only here so keep AP first as static"
            if len(cleaned) >= 2:
                cleaned = "AP" + cleaned[2:]
            
            # Fuzzy Validation: Try to fix common issues
            is_valid = validate_indian_plate(cleaned)
            
            if not is_valid and cleaned:
                # Try removing last char (common for border noise)
                if validate_indian_plate(cleaned[:-1]):
                    cleaned = cleaned[:-1]
                    is_valid = True
                # Try removing first char
                elif validate_indian_plate(cleaned[1:]):
                    cleaned = cleaned[1:]
                    is_valid = True
                    
            final_conf = calculate_confidence(avg_ocr_conf, is_valid)
            
            # Format output XX 00 XX 0000
            if cleaned and len(cleaned) >= 6:
                # Try to format intelligently if valid
                if is_valid:
                    # E.g. KA01AB1234 -> KA 01 AB 1234
                    # Heuristic split based on pattern
                    match = re.match(r'^([A-Z]{2})([0-9]{1,2})([A-Z]{1,2})([0-9]{4})$', cleaned)
                    if match:
                        formatted = f"{match.group(1)} {match.group(2)} {match.group(3)} {match.group(4)}"
                    else:
                        formatted = cleaned
                else:
                    formatted = cleaned
            else:
                formatted = cleaned

            if final_conf > best_result['confidence']:
                best_result = {
                    'text': formatted, # Vehicle number
                    'confidence': final_conf,
                    'raw_text': raw_text,
                    'debug': {
                        'method': method,
                        'ocr_conf': avg_ocr_conf,
                        'regex_valid': is_valid
                    }
                }
                
            # Early exit if we have a robust match
            if final_conf > 0.85 and is_valid:
                break
                
        except Exception as e:
            print(f"OCR Pass Error ({method}): {e}")
            continue
            
    if best_result['text']:
        return best_result
        
    return None
